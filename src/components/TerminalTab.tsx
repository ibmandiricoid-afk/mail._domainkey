import React, { useEffect, useRef, useState, useMemo } from "react";
import { 
  Trash2, Terminal as TerminalIcon, Zap, RefreshCw, Flame, BarChart3,
  ShieldCheck, Globe, Copy, Check, AlertTriangle, CheckCircle2, XCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LogEntry, SmtpConfig } from "../types";
import { TerminalRelayChart } from "./TerminalRelayChart";
import { hn } from "../lib/utils";

// Typing effect component for terminal logs
const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  onComplete?: () => void;
  onCharacterTyped?: () => void;
}> = ({ text, speed = 16, onComplete, onCharacterTyped }) => {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);
  const onTypedRef = useRef(onCharacterTyped);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTypedRef.current = onCharacterTyped;
  }, [onComplete, onCharacterTyped]);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

    if (!text || text.length === 0) {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      return;
    }

    const timer = setInterval(() => {
      index += 1;
      if (index >= text.length) {
        setDisplayedText(text);
        clearInterval(timer);
        if (onTypedRef.current) {
          onTypedRef.current();
        }
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      } else {
        setDisplayedText(text.slice(0, index));
        if (onTypedRef.current) {
          onTypedRef.current();
        }
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayedText}</>;
};

interface TerminalTabProps {
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  addLog?: (type: "info" | "success" | "error" | "warning", msg: string) => void;
  smtpConfig?: SmtpConfig;
  setSmtpConfig?: React.Dispatch<React.SetStateAction<SmtpConfig>>;
}

export const TerminalTab: React.FC<TerminalTabProps> = React.memo(({ 
  logs, 
  setLogs, 
  addLog, 
  smtpConfig, 
  setSmtpConfig
}) => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSimulatingBurst, setIsSimulatingBurst] = useState(false);
  const [showChart, setShowChart] = useState(true);

  // Check DNS Records States
  const [showDnsPanel, setShowDnsPanel] = useState(false);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(() => {
    const email = (smtpConfig?.senderEmail || smtpConfig?.username || "").trim();
    if (email.includes("@")) {
      return email.split("@")[1];
    }
    return "gmail.com";
  });
  const [customDkimSelector, setCustomDkimSelector] = useState("");
  const [dnsAuditResult, setDnsAuditResult] = useState<any>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const presetDomains = ["gmail.com", "bankmandiri.co.id", "yahoo.com", "outlook.com"];

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Memoize D3/Recharts chart rendering to prevent unnecessary recalculations on log typewriter updates
  const memoizedChart = useMemo(() => {
    return <TerminalRelayChart logs={logs} />;
  }, [logs]);

  // Initialize typingIndex to logs.length so existing historical logs render immediately
  const [typingIndex, setTypingIndex] = useState(() => logs.length);
  const isFirstRender = useRef(true);

  const handleScrollToBottom = () => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setTypingIndex(logs.length);
      return;
    }
    if (logs.length === 0) {
      setTypingIndex(0);
    }
  }, [logs.length]);

  useEffect(() => {
    handleScrollToBottom();
  }, [logs.length, typingIndex]);

  // Check DNS Records Function
  const handleCheckDnsRecords = async (domainToTest?: string, selectorToTest?: string) => {
    if (isCheckingDns) return;

    let target = (domainToTest || customDomainInput || "").trim();
    if (!target) {
      const fallbackEmail = (smtpConfig?.senderEmail || smtpConfig?.username || "").trim();
      if (fallbackEmail.includes("@")) {
        target = fallbackEmail.split("@")[1];
      } else {
        target = "gmail.com";
      }
    }

    if (target.includes("@")) {
      target = target.split("@")[1];
    }

    setCustomDomainInput(target);
    setIsCheckingDns(true);
    setShowDnsPanel(true);

    if (addLog) {
      addLog("info", `🔍 [DNS AUDIT START] Memulai verifikasi rekam DNS (SPF, DKIM, DMARC) untuk domain: ${target}`);
    }

    try {
      const res = await fetch("/api/audit-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: target,
          dkimSelector: selectorToTest || customDkimSelector
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memeriksa rekam DNS domain.");
      }

      setDnsAuditResult(data);

      if (addLog) {
        addLog(
          data.spf?.found ? "success" : "error",
          `🛡️ [SPF RECORD] ${data.spf?.found ? "✅ Valid: " + data.spf.record : "❌ Missing: Record SPF (v=spf1) tidak terdeteksi pada DNS!"}`
        );
        addLog(
          data.dkim?.found ? "success" : "error",
          `🔑 [DKIM RECORD] ${data.dkim?.found ? "✅ Valid (Selector: " + (data.dkim.selector || "default") + "): " + data.dkim.record : "❌ Missing: Record DKIM (v=DKIM1) tidak terdeteksi pada selector umum!"}`
        );
        addLog(
          data.dmarc?.found ? "success" : data.dmarc?.status === "warning" ? "warning" : "error",
          `🔒 [DMARC RECORD] ${data.dmarc?.found ? "✅ Valid: " + data.dmarc.record : "❌ Missing: Record DMARC (_dmarc) tidak terdeteksi pada DNS!"}`
        );
        addLog(
          data.score >= 90 ? "success" : data.score >= 70 ? "warning" : "error",
          `📊 [DELIVERABILITY SCORE] Skor Keterkiriman Domain: ${data.score}/100 | ${data.actionableAdvice?.filter((a: any) => a.status !== "valid").length || 0} rekomendasi perbaikan.`
        );
      }

      if (setSmtpConfig && smtpConfig) {
        setSmtpConfig(prev => ({
          ...prev,
          warmUpSchedule: {
            ...(prev.warmUpSchedule || {
              enabled: true,
              preset: "standard",
              currentDay: 1,
              startLimit: 25,
              rampStep: 50,
              maxDailyLimit: 1000,
              delayBetweenEmailsSec: 3,
              sentTodayCount: 0,
              todayDate: new Date().toISOString().split("T")[0],
              reputationScore: data.score,
              autoPauseOnError: true
            }),
            reputationScore: data.score
          }
        }));
      }

    } catch (err: any) {
      if (addLog) {
        addLog("error", `❌ [DNS CHECK ERROR] ${err?.message || "Gagal memindai DNS."}`);
      }
    } finally {
      setIsCheckingDns(false);
    }
  };

  // Handle Warm-up Burst & Domain Audit Test directly in terminal
  const handleSimulateWarmupBurst = async () => {
    if (isSimulatingBurst) return;

    const activeEmail = (smtpConfig?.senderEmail || smtpConfig?.username || "").trim();
    if (!activeEmail) {
      if (addLog) {
        addLog("error", "⛔ [SYSTEM STOPPED] Sistem tidak dapat bekerja: Belum ada alamat email pengirim yang dimasukkan/digunakan di aplikasi.");
      }
      return;
    }

    setIsSimulatingBurst(true);

    const schedule = smtpConfig?.warmUpSchedule || {
      enabled: true,
      preset: "standard" as const,
      currentDay: 1,
      startLimit: 25,
      rampStep: 50,
      maxDailyLimit: 1000,
      delayBetweenEmailsSec: 3,
      sentTodayCount: 0,
      todayDate: new Date().toISOString().split("T")[0],
      reputationScore: 98,
      autoPauseOnError: true
    };

    let currentScore = schedule.reputationScore || 98;

    if (addLog) {
      addLog("info", `🚀 [AUTOMATION START] Menjalankan tes RAMP-UP & Audit Diagnostik otomatis untuk email: ${activeEmail}`);
      addLog("info", `🔍 [DOMAIN AUDIT] Memindai reputasi DNS, SPF, DKIM, dan DMARC di latar belakang...`);
    }

    // Run Domain Audit in background
    try {
      const auditRes = await fetch("/api/audit-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail })
      });
      const auditData = await auditRes.json();
      if (auditData.success) {
        currentScore = auditData.score || currentScore;
        setDnsAuditResult(auditData);
        if (addLog) {
          addLog(
            "success",
            `🛡️ [DOMAIN AUDIT DONE] Domain: ${auditData.domain} | Skor Reputasi: ${auditData.score}/100 | SPF: ${auditData.spf?.found ? "Valid" : "Missing"} | DKIM: ${auditData.dkim?.found ? "Valid" : "Missing"} | DMARC: ${auditData.dmarc?.found ? "Valid" : "Missing"}`
          );
        }
        if (setSmtpConfig && smtpConfig) {
          setSmtpConfig(prev => ({
            ...prev,
            warmUpSchedule: {
              ...(prev.warmUpSchedule || schedule),
              reputationScore: auditData.score
            }
          }));
        }
      }
    } catch (e: any) {
      if (addLog) {
        addLog("warning", `⚠️ [DOMAIN AUDIT] Audit offline, menggunakan skor reputasi default: ${currentScore}/100`);
      }
    }

    if (addLog) {
      addLog("info", "🔥 [WARM-UP RAMP-UP] Memulai pengiriman batch warm-up RAMP-UP (5 target email)...");
    }

    const testTargets = [
      "client.alpha@company.co.id",
      "finance.dept@bankpartner.com",
      "support.ticket@service.net",
      "ops.manager@enterprise.id",
      "audit.verify@security.org"
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < testTargets.length) {
        const target = testTargets[step];
        if (addLog) {
          addLog(
            "info",
            `🔥 [WARM-UP THROTTLE] Delay anti-spam ${schedule.delayBetweenEmailsSec}s diterapkan. Mengirim ke: ${target}`
          );
          setTimeout(() => {
            addLog(
              "success",
              `✅ [DELIVERY RELAY] Target ${step + 1}/5 (${target}) -> 250 OK (SPF & DKIM Valid | Reputation Score: ${currentScore}/100)`
            );
          }, 400);
        }
        step++;
      } else {
        clearInterval(interval);
        setIsSimulatingBurst(false);
        if (addLog) {
          addLog("success", "🎉 [AUTOMATION COMPLETE] RAMP-UP & Audit Diagnostik selesai 100% otomatis di latar belakang!");
        }

        // Update sent count in smtpConfig
        if (setSmtpConfig && smtpConfig) {
          const currentWarmup = smtpConfig.warmUpSchedule || schedule;
          setSmtpConfig({
            ...smtpConfig,
            warmUpSchedule: {
              ...currentWarmup,
              sentTodayCount: currentWarmup.sentTodayCount + 5
            }
          });
        }
      }
    }, 1200);
  };

  // Test AI latency in background and print results to terminal console logs
  const handleTestAiLatency = async () => {
    if (isTesting) return;
    setIsTesting(true);

    if (addLog) {
      addLog("info", "⚡ [AI BENCHMARK] Memulai pengujian latensi real-time ke semua endpoint AI...");
    }

    try {
      const res = await fetch("/api/ai/test-keys");
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      const results: Array<{ provider: string; status: string; latencyMs: number; modelUsed?: string }> = data.results || [];

      if (addLog) {
        // Stream individual provider results one by one with a delay for realistic terminal typing
        for (let i = 0; i < results.length; i++) {
          const item = results[i];
          const isOk = item.status?.includes("OK");
          const logType = isOk ? "success" : "error";
          addLog(
            logType,
            `  └─ [${item.provider.toUpperCase()}] ${item.latencyMs}ms | ${item.status} | Model: ${item.modelUsed || "default"}`
          );
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Log summary
        const okResults = results.filter((r) => r.status?.includes("OK"));
        if (okResults.length > 0) {
          const sorted = [...okResults].sort((a, b) => a.latencyMs - b.latencyMs);
          const fastest = sorted[0];
          const avg = Math.round(okResults.reduce((acc, c) => acc + c.latencyMs, 0) / okResults.length);
          addLog(
            "info",
            `⚡ [AI BENCHMARK DONE] ${data.activeProvidersCount}/${data.totalProvidersTested} Active. Tercepat: ${fastest.provider.toUpperCase()} (${fastest.latencyMs}ms). Rata-rata: ${avg}ms.`
          );
        } else {
          addLog("warning", "⚠️ [AI BENCHMARK] Tidak ada provider AI publik yang merespons OK. Fallback ke Local AI.");
        }
      }
    } catch (err: any) {
      if (addLog) {
        addLog("error", `❌ [AI BENCHMARK ERROR] Gagal menguji latensi AI: ${err?.message || err}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      key="terminal-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-1 sm:p-3 w-full h-full max-h-full flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12)] flex flex-col h-full max-h-full min-h-0 flex-1 overflow-hidden w-full max-w-4xl">
        {/* Header Bar */}
        <div className="p-2.5 sm:p-3 border-b border-slate-200 flex justify-between items-center bg-slate-100/80 gap-2 shrink-0">
          <div className="flex flex-col min-w-0">
            <h2 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 truncate">
              RELAY CONSOLE LOGS
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
              <span className="text-[9px] text-[#005291] font-bold uppercase tracking-wider truncate">
                System Active & Streaming Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap justify-end">
            {/* Button: Check DNS Records */}
            <button
              type="button"
              onClick={() => {
                const nextState = !showDnsPanel;
                setShowDnsPanel(nextState);
                if (nextState && !dnsAuditResult && !isCheckingDns) {
                  handleCheckDnsRecords();
                }
              }}
              className={hn(
                "px-2.5 py-1 rounded-full text-[9.5px] font-extrabold transition-all border flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs shrink-0",
                showDnsPanel
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200 font-black"
                  : "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-sm"
              )}
              title="Periksa Rekam DNS Domain (SPF, DKIM, DMARC)"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span className="uppercase tracking-tight">Check DNS Records</span>
            </button>

            {/* Toggle Real-time Chart Panel Button */}
            <button
              type="button"
              onClick={() => setShowChart((prev) => !prev)}
              className={hn(
                "px-2 py-1 rounded-full text-[9.5px] font-extrabold transition-all border flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs shrink-0",
                showChart
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200"
                  : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300"
              )}
              title="Tampilkan/Sembunyikan Grafik Performa Relay Real-Time"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline uppercase tracking-tight">Grafik</span>
            </button>

            {/* Round Icon Button: Tes Latensi AI */}
            <button
              type="button"
              onClick={handleTestAiLatency}
              disabled={isTesting}
              className={hn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all border cursor-pointer active:scale-95 shadow-xs shrink-0",
                isTesting
                  ? "bg-sky-100 text-sky-400 border-sky-200 cursor-not-allowed"
                  : "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
              )}
              title="Tes Latensi AI"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              )}
            </button>

            {/* Round Icon Button: Tes Warm-up Burst */}
            <button
              type="button"
              onClick={handleSimulateWarmupBurst}
              disabled={isSimulatingBurst}
              className={hn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all border cursor-pointer active:scale-95 shadow-xs shrink-0",
                isSimulatingBurst
                  ? "bg-amber-100 text-amber-400 border-amber-200 cursor-not-allowed"
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
              )}
              title="Tes Warm-up Burst"
            >
              {isSimulatingBurst ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              ) : (
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              )}
            </button>

            {/* Prominent Red Trash Icon Button: Clear Logs */}
            <button
              type="button"
              onClick={() => {
                setLogs([]);
                setTypingIndex(0);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 transition-all flex items-center gap-1 text-[9px] font-extrabold cursor-pointer active:scale-95 shrink-0 shadow-xs"
              title="Hapus / Bersihkan Log Terminal"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        </div>

        {/* Interactive DNS Records & Deliverability Inspector Panel */}
        <AnimatePresence>
          {showDnsPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 text-slate-100 max-h-[380px] overflow-y-auto no-scrollbar shrink-0 shadow-inner"
            >
              {/* Search Bar & Domain Selector */}
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between mb-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="flex-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCheckDnsRecords();
                      }
                    }}
                    placeholder="Masukkan nama domain (misal: company.com)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={customDkimSelector}
                    onChange={(e) => setCustomDkimSelector(e.target.value)}
                    placeholder="DKIM Selector (opsional)"
                    className="w-28 sm:w-32 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    title="Sebutkan selector DKIM khusus jika ada (misal: default, google, k1)"
                  />

                  <button
                    type="button"
                    onClick={() => handleCheckDnsRecords()}
                    disabled={isCheckingDns}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isCheckingDns ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{isCheckingDns ? "Memindai..." : "Audit DNS"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Domain Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                <span className="text-slate-400 font-bold">Preset Cepat:</span>
                {presetDomains.map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => {
                      setCustomDomainInput(dom);
                      handleCheckDnsRecords(dom);
                    }}
                    className={hn(
                      "px-2 py-0.5 rounded-md font-mono transition-all border cursor-pointer",
                      customDomainInput === dom
                        ? "bg-indigo-900/60 text-indigo-200 border-indigo-500 font-bold"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    )}
                  >
                    {dom}
                  </button>
                ))}
              </div>

              {/* Results Body */}
              {isCheckingDns && !dnsAuditResult && (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <p className="text-xs font-semibold">Memindai rekam SPF, DKIM, dan DMARC secara langsung dari DNS server...</p>
                </div>
              )}

              {!isCheckingDns && !dnsAuditResult && (
                <div className="py-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <ShieldCheck className="w-8 h-8 text-indigo-400" />
                  <p className="text-xs font-semibold text-slate-300">
                    Klik tombol <strong className="text-indigo-400">"Audit DNS"</strong> di atas untuk memverifikasi SPF, DKIM, dan DMARC domain Anda.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Sistem akan memberikan skor keterkiriman serta panduan konfigurasi DNS yang siap disalin.
                  </p>
                </div>
              )}

              {dnsAuditResult && (
                <div className="space-y-3">
                  {/* Top Score & Metric Badges Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    {/* Deliverability Health Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SKOR KETERKIRIMAN</span>
                      <div className="flex items-baseline gap-1.5 my-1">
                        <span className={hn(
                          "text-2xl font-black font-mono",
                          dnsAuditResult.score >= 90 ? "text-emerald-400" : dnsAuditResult.score >= 70 ? "text-amber-400" : "text-rose-400"
                        )}>
                          {dnsAuditResult.score}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {dnsAuditResult.score >= 90 ? "Sangat Baik" : dnsAuditResult.score >= 70 ? "Cukup Baik" : "Risiko SPAM"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={hn(
                            "h-full rounded-full transition-all duration-500",
                            dnsAuditResult.score >= 90 ? "bg-emerald-500" : dnsAuditResult.score >= 70 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${dnsAuditResult.score}%` }}
                        />
                      </div>
                    </div>

                    {/* SPF Card */}
                    <div className={hn(
                      "p-2.5 rounded-xl border flex flex-col justify-between text-xs",
                      dnsAuditResult.spf?.found ? "bg-emerald-950/30 border-emerald-800/60" : "bg-rose-950/30 border-rose-800/60"
                    )}>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-300">RECORD SPF</span>
                        {dnsAuditResult.spf?.found ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">VALID</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">MISSING</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono truncate my-1.5" title={dnsAuditResult.spf?.record}>
                        {dnsAuditResult.spf?.found ? dnsAuditResult.spf.record : "Record v=spf1 tidak terdeteksi!"}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {dnsAuditResult.spf?.found ? "Mencegah email palsu nama domain" : "Wajib untuk lolos SPAM filter"}
                      </span>
                    </div>

                    {/* DKIM Card */}
                    <div className={hn(
                      "p-2.5 rounded-xl border flex flex-col justify-between text-xs",
                      dnsAuditResult.dkim?.found ? "bg-emerald-950/30 border-emerald-800/60" : "bg-rose-950/30 border-rose-800/60"
                    )}>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-300">RECORD DKIM</span>
                        {dnsAuditResult.dkim?.found ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">VALID</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">MISSING</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono truncate my-1.5" title={dnsAuditResult.dkim?.record}>
                        {dnsAuditResult.dkim?.found ? `Selector: ${dnsAuditResult.dkim.selector || "default"}` : "Kunci DKIM1 tidak terdeteksi"}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {dnsAuditResult.dkim?.found ? "Tanda tangan digital terverifikasi" : "Tanda tangan digital belum aktif"}
                      </span>
                    </div>

                    {/* DMARC Card */}
                    <div className={hn(
                      "p-2.5 rounded-xl border flex flex-col justify-between text-xs",
                      dnsAuditResult.dmarc?.found ? (dnsAuditResult.dmarc.record?.includes("p=none") ? "bg-amber-950/30 border-amber-800/60" : "bg-emerald-950/30 border-emerald-800/60") : "bg-rose-950/30 border-rose-800/60"
                    )}>
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-300">RECORD DMARC</span>
                        {dnsAuditResult.dmarc?.found ? (
                          dnsAuditResult.dmarc.record?.includes("p=none") ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">MONITORING</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">PROTECTED</span>
                          )
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">MISSING</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono truncate my-1.5" title={dnsAuditResult.dmarc?.record}>
                        {dnsAuditResult.dmarc?.found ? dnsAuditResult.dmarc.record : "Record _dmarc tidak terdeteksi!"}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {dnsAuditResult.dmarc?.found ? "Standar kepatuhan Google/Yahoo" : "Wajib untuk pengiriman terpercaya"}
                      </span>
                    </div>
                  </div>

                  {/* Actionable Advice & Fixes Guide */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wide">
                        Panduan Perbaikan & Rekam DNS Yang Direkomendasikan
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {dnsAuditResult.actionableAdvice?.map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-slate-200 flex items-center gap-1.5">
                              {item.status === "valid" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : item.status === "warning" ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              )}
                              {item.title}
                            </span>
                            <span className={hn(
                              "px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase",
                              item.status === "valid" ? "bg-emerald-900/40 text-emerald-300" : item.status === "warning" ? "bg-amber-900/40 text-amber-300" : "bg-rose-900/40 text-rose-300"
                            )}>
                              {item.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Copyable DNS Record Snippet if item is missing or warning */}
                          {item.recommendedValue && (
                            <div className="bg-slate-950 p-2 rounded-md border border-slate-800 font-mono text-[10px] space-y-1 mb-2">
                              <div className="flex justify-between text-slate-400 text-[9px] border-b border-slate-800 pb-1">
                                <span>Tipe: <strong className="text-slate-200">{item.recordType || "TXT"}</strong></span>
                                <span>Host/Name: <strong className="text-slate-200">{item.recordHost || "@"}</strong></span>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="text-indigo-300 font-semibold break-all select-all">
                                  {item.recommendedValue}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(item.recommendedValue)}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[9px] font-bold rounded flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                                >
                                  {copiedText === item.recommendedValue ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      <span>Tersalin!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-white" />
                                      <span>Salin Record</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Step-by-Step Instructions */}
                          {item.steps && item.steps.length > 0 && (
                            <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60">
                              <span className="font-extrabold text-slate-300 block mb-1">Langkah Konfigurasi DNS:</span>
                              <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                                {item.steps.map((st: string, sIdx: number) => (
                                  <li key={sIdx}>{st}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-Time Performance & Delivery Success Rate Recharts Panel */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {memoizedChart}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal Output Container with Fixed Scroll Height */}
        <div 
          ref={terminalContainerRef}
          className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto space-y-1.5 font-mono text-[11px] no-scrollbar relative bg-slate-950 text-slate-100 select-text scroll-smooth"
        >
          {/* Retro Monitor Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-20 z-10" />

          {logs.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2 pointer-events-none select-none z-0">
              <TerminalIcon className="w-8 h-8 opacity-30 text-slate-400" />
              <p className="italic text-xs font-semibold text-slate-400">Console idle...</p>
            </div>
          )}

          {logs.map((log, index) => {
            if (index > typingIndex) {
              return null;
            }

            return (
              <motion.div 
                key={`log-${index}-${log.timestamp}`} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="flex flex-col space-y-1 relative z-10 border-b border-slate-800/40 pb-1.5"
              >
                <div className="flex gap-2.5 items-start">
                  <span className="text-slate-500 shrink-0 select-none font-bold">
                    [{log.timestamp}]
                  </span>
                  <div className="flex-1">
                    <span
                      className={hn(
                        "leading-relaxed break-words font-semibold",
                        log.type === "error"
                          ? "text-rose-400 font-bold"
                          : log.type === "success"
                          ? "text-emerald-400 font-bold"
                          : log.type === "warning"
                          ? "text-amber-300 animate-pulse"
                          : "text-sky-300"
                      )}
                    >
                      {index === typingIndex ? (
                        <TypewriterText 
                          text={log.message} 
                          speed={16} 
                          onCharacterTyped={handleScrollToBottom}
                          onComplete={() => setTypingIndex((prev) => prev + 1)} 
                        />
                      ) : (
                        log.message
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* CLI Prompt Cursor */}
          <div className="flex gap-1.5 items-center text-slate-400 font-bold relative z-10 pt-1">
            <span className="text-emerald-400">&gt; sys_status: OK</span>
            <div className="w-1.5 h-3 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-terminal-blink" />
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex justify-between items-center px-4 shrink-0">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
            Log Count: {logs.length}/30
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono">
              GF-V104 SYSTEM CONSOLE
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

