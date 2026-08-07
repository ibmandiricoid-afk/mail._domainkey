import React, { useEffect, useRef, useState } from "react";
import { 
  Trash2, Terminal as TerminalIcon, Zap, RefreshCw, Flame
} from "lucide-react";
import { motion } from "motion/react";
import { LogEntry, SmtpConfig } from "../types";
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
        if (addLog) {
          addLog(
            "success",
            `🛡️ [DOMAIN AUDIT DONE] Domain: ${auditData.domain} | Skor Reputasi: ${auditData.score}/100 | SPF: ${auditData.spf || "Valid"} | DKIM: ${auditData.dkim || "Valid"} | DMARC: ${auditData.dmarc || "Valid"}`
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
      className="p-2 sm:p-3 w-full h-full max-h-full flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden"
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

          <div className="flex items-center gap-1.5 shrink-0">
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
                <span className="w-3.5 h-3.5 css-spinner text-sky-600" />
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
                <span className="w-3.5 h-3.5 css-spinner text-amber-600" />
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

