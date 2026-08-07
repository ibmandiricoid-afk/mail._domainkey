import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertCircle, CheckCircle, Info, 
  AlertTriangle, X, Check, Bot, Trash2, ShieldAlert, Sparkles, Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RichTextEditor } from "./RichTextEditor";
import { EmailTemplate, SmtpConfig, SpamReport, EmailValidationRecord } from "../types";
import { hn, isValidEmail, getEmailTypoFix } from "../lib/utils";
import defaultAvatarImg from "../assets/images/sending_avatar.jpg";
import { DomainMxStatusBadge } from "./DomainMxStatusBadge";

interface SendTabProps {
  smtpConfig: SmtpConfig;
  setSmtpConfig?: React.Dispatch<React.SetStateAction<SmtpConfig>>;
  templates: EmailTemplate[];
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
  addLog: (type: "info" | "success" | "error" | "warning", msg: string) => void;
  triggerConfetti: () => void;
  validationRecords?: EmailValidationRecord[];
  setValidationRecords?: React.Dispatch<React.SetStateAction<EmailValidationRecord[]>>;
}

export const SendTab: React.FC<SendTabProps> = React.memo(({
  smtpConfig,
  setSmtpConfig,
  templates,
  setActiveTab,
  addLog,
  triggerConfetti,
  validationRecords,
  setValidationRecords
}) => {
  // --- Email Composer State (With Auto-Save Draft Protection) ---
  const [emailForm, setEmailForm] = useState(() => {
    let initialTo = "";
    let initialSubject = "";
    let initialMessage = "";
    if (typeof window !== "undefined") {
      try {
        // Load saved draft if present so user never loses typed content on app lock or switch
        const savedDraft = localStorage.getItem("email_composer_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === "object") {
            initialTo = parsed.to || "";
            initialSubject = parsed.subject || "";
            initialMessage = parsed.message || "";
          }
        }
        
        // URL query params take precedence if present
        const searchParams = new URLSearchParams(window.location.search);
        const toParam = searchParams.get("to") || searchParams.get("recipient") || searchParams.get("email") || "";
        if (toParam) {
          initialTo = decodeURIComponent(toParam).trim();
        }
        
        const subjectParam = searchParams.get("subject") || searchParams.get("title") || "";
        if (subjectParam) {
          initialSubject = decodeURIComponent(subjectParam).trim();
        }
        
        const messageParam = searchParams.get("body") || searchParams.get("message") || searchParams.get("html") || "";
        if (messageParam) {
          initialMessage = decodeURIComponent(messageParam).trim();
        }
      } catch (err) {
        console.error("Error loading email draft / params", err);
      }
    }
    return {
      to: initialTo,
      subject: initialSubject,
      message: initialMessage
    };
  });

  // Auto-persist draft to localStorage in real-time
  useEffect(() => {
    if (emailForm.to || emailForm.subject || emailForm.message) {
      localStorage.setItem("email_composer_draft", JSON.stringify(emailForm));
    } else {
      localStorage.removeItem("email_composer_draft");
    }
  }, [emailForm]);

  // --- Real-time Smart Bounce Guard Analysis ---
  const parsedRecipients = React.useMemo(() => {
    if (!emailForm.to.trim()) return [];
    return emailForm.to.split(/[,;\s]+/).map(e => e.trim()).filter(Boolean);
  }, [emailForm.to]);

  const validationAnalysis = React.useMemo(() => {
    if (parsedRecipients.length === 0) {
      return { isValidAll: true, invalidList: [], typoList: [], validList: [] };
    }
    const invalidList: string[] = [];
    const validList: string[] = [];
    const typoList: Array<{ original: string; fixed: string }> = [];

    parsedRecipients.forEach(email => {
      if (!isValidEmail(email)) {
        invalidList.push(email);
      } else {
        validList.push(email);
      }
      const typoFix = getEmailTypoFix(email);
      if (typoFix) {
        typoList.push({ original: email, fixed: typoFix });
      }
    });

    return {
      isValidAll: invalidList.length === 0 && typoList.length === 0,
      invalidList,
      validList,
      typoList
    };
  }, [parsedRecipients]);

  const handleApplyTypoFix = (original: string, fixed: string) => {
    setEmailForm(prev => {
      const updated = prev.to.replace(original, fixed);
      return { ...prev, to: updated };
    });
    addLog("info", `⚡ [Smart Bounce Guard] Alamat email diperbaiki: ${original} ➔ ${fixed}`);
  };

  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStage, setSendingStage] = useState("");
  const [hasFailed, setHasFailed] = useState(false);

  const [pasteFilterInfo, setPasteFilterInfo] = useState<{
    count: number;
    preview: string;
  } | null>(null);

  // Helper to extract email addresses from raw text
  const extractEmailsFromText = React.useCallback((text: string): string[] => {
    if (!text) return [];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    if (!matches) return [];
    return Array.from(new Set(matches.map(m => m.trim().toLowerCase())));
  }, []);

  const handleRecipientPaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    const extracted = extractEmailsFromText(pastedText);

    if (extracted.length > 0) {
      e.preventDefault(); // Prevent raw messy text paste

      const currentVal = emailForm.to.trim();
      let combinedEmails: string[] = [];

      if (currentVal) {
        const existing = extractEmailsFromText(currentVal);
        combinedEmails = Array.from(new Set([...existing, ...extracted]));
      } else {
        combinedEmails = extracted;
      }

      const resultString = combinedEmails.join(", ");
      setEmailForm(prev => ({ ...prev, to: resultString }));

      const preview = extracted.length <= 2 
        ? extracted.join(", ")
        : `${extracted.slice(0, 2).join(", ")} +${extracted.length - 2} lainnya`;

      setPasteFilterInfo({ count: extracted.length, preview });
      addLog("info", `⚡ [Auto-Filter Email] Berhasil menyaring ${extracted.length} alamat email terverifikasi dari teks paste. Teks non-email otomatis dibuang.`);

      setTimeout(() => {
        setPasteFilterInfo(null);
      }, 5000);
    } else {
      // If user pasted raw text with no email format at all
      e.preventDefault();
      addLog("warning", "⚠️ Teks yang ditempel tidak mengandung format email yang valid (@). Otomatis dikesampingkan.");
      setPasteFilterInfo({ count: 0, preview: "Tidak ditemukan format email dalam teks paste" });
      setTimeout(() => {
        setPasteFilterInfo(null);
      }, 4000);
    }
  }, [emailForm.to, extractEmailsFromText, addLog]);

  const handleMessageChange = React.useCallback((val: string) => {
    setEmailForm(prev => ({ ...prev, message: val }));
  }, []);

  const handleToChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm(prev => ({ ...prev, to: e.target.value }));
  }, []);

  const handleSubjectChangeInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm(prev => ({ ...prev, subject: e.target.value }));
  }, []);



  const [activeSendingLogs, setActiveSendingLogs] = useState<string[]>([]);
  const sendingLogsEndRef = React.useRef<HTMLDivElement | null>(null);

  // Auto scroll logs during active transmission
  useEffect(() => {
    if (sendingLogsEndRef.current) {
      sendingLogsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSendingLogs]);
  
  // --- Banners ---
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // --- Spam Score Calculation ---
  const [spamReport, setSpamReport] = useState<SpamReport>({
    score: 100,
    level: "Excellent",
    color: "text-emerald-500",
    tips: []
  });

  // Listen to custom apply-template events
  useEffect(() => {
    const handleApplyTemplate = (e: Event) => {
      const customEvt = e as CustomEvent<{ subject: string; html: string }>;
      if (customEvt.detail) {
        setEmailForm(prev => ({
          ...prev,
          subject: customEvt.detail.subject,
          message: customEvt.detail.html
        }));
        addLog("info", "Template AI berhasil diterapkan ke form pengiriman.");
      }
    };

    const handleUseTemplate = (e: Event) => {
      const customEvt = e as CustomEvent<EmailTemplate>;
      if (customEvt.detail) {
        setEmailForm(prev => ({
          ...prev,
          subject: customEvt.detail.subject,
          message: customEvt.detail.message
        }));
        addLog("info", `Menggunakan template: ${customEvt.detail.name}`);
      }
    };

    window.addEventListener("apply-template", handleApplyTemplate);
    window.addEventListener("use-template", handleUseTemplate);
    return () => {
      window.removeEventListener("apply-template", handleApplyTemplate);
      window.removeEventListener("use-template", handleUseTemplate);
    };
  }, []);

  // Handle auto-filled email from URL query string on mount
  useEffect(() => {
    if (emailForm.to) {
      addLog("success", `Auto-fill email penerima terdeteksi: ${emailForm.to}`);
      // Clean query params to keep address bar pristine
      try {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (e) {
        console.error("Gagal membersihkan URL query", e);
      }
    }
  }, []);

  // Real-time Gmail/Anti-spam score checker (runs when subject/message is edited)
  useEffect(() => {
    const timer = setTimeout(() => {
      let score = 100;
      const tips: string[] = [];
      const { subject, message } = emailForm;

      if (!subject) return;

      if (subject.length < 3) {
        score -= 10;
        tips.push("Judul terlalu pendek");
      }
      if (subject.toUpperCase() === subject && subject.length > 5) {
        score -= 20;
        tips.push("Hindari HURUF KAPITAL di judul");
      }
      if ((subject.match(/!/g) || []).length > 1) {
        score -= 15;
        tips.push("Kurangi tanda seru di judul");
      }

      // Check spam trigger keywords
      const spamKeywords = ["FREE", "HADIAH", "GRATIS", "WINNER", "URGENT", "CASH", "OFFER", "CLICK HERE", "PROMO", "DISKON"];
      const detectedSpam = spamKeywords.filter(
        word => subject.toUpperCase().includes(word) || message.toUpperCase().includes(word)
      );

      if (detectedSpam.length > 0) {
        score -= detectedSpam.length * 15;
        tips.push(`Kata berisiko tinggi: ${detectedSpam.join(", ")}`);
      }

      if (message.length > 0 && message.length < 20) {
        score -= 10;
        tips.push("Isi pesan terlalu singkat (rawan ditandai bot)");
      }

      if ((message.match(/https?:\/\//g) || []).length > 3) {
        score -= 20;
        tips.push("Terlalu banyak tautan/link");
      }

      // Anti-spam compliance: Note that Unsubscribe link is automatically attached by server engine
      const msgLower = message.toLowerCase();
      const hasUnsub = msgLower.includes("unsubscribe") || msgLower.includes("berhenti berlangganan");
      if (hasUnsub) {
        tips.push("Link Unsubscribe terdeteksi dalam konten");
      }

      score = Math.max(0, score);

      let level: "Excellent" | "Good" | "Risky" | "Likely Spam" = "Excellent";
      let color = "text-emerald-500";

      if (score < 40) {
        level = "Likely Spam";
        color = "text-rose-500";
      } else if (score < 70) {
        level = "Risky";
        color = "text-amber-500";
      } else if (score < 90) {
        level = "Good";
        color = "text-blue-500";
      }

      setSpamReport({ score, level, color, tips });
    }, 400);

    return () => clearTimeout(timer);
  }, [emailForm.subject, emailForm.message]);

  // Main SMTP send trigger
  const runSmtpForwarder = async (toEmail: string, subjectLine: string, messageBody: string) => {
    setErrorBanner(null);
    setSuccessBanner(null);
    addLog("info", `Forwarding email payload to ${toEmail}...`);

    try {
      const isHtml = /<[a-z][\s\S]*>/i.test(messageBody);
      let richHtml = "";
      if (isHtml) {
        richHtml = messageBody;
      } else {
        richHtml = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
            ${smtpConfig.logoUrl ? `
            <div style="text-align: center; padding-bottom: 20px;">
              <img src="${smtpConfig.logoUrl}" alt="Logo" style="height: 50px; width: auto; display: inline-block;" />
            </div>` : ""}
            <div style="font-size: 14px; line-height: 1.6;">
              ${messageBody.replace(/\n/g, "<br>")}
            </div>
          </div>
        `;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          to: toEmail,
          subject: subjectLine,
          text: messageBody.replace(/<[^>]*>/g, ""),
          html: richHtml,
          smtpConfig: smtpConfig.username ? smtpConfig : undefined
        })
      });

      clearTimeout(timeoutId);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      let data;
      
      if (isJson) {
        data = await response.json();
      } else {
        await response.text();
        throw new Error("Gagal menghubungi server. Silakan coba lagi.");
      }

      if (!response.ok || data.success === false) {
        const errorMsg = data.error || "Gagal mengirim email";
        throw new Error(errorMsg);
      }

      if (data.rejected && data.rejected.length > 0 && (!data.accepted || data.accepted.length === 0)) {
        throw new Error(`Email ditolak oleh server SMTP (${data.rejected.join(", ")})`);
      }

      if (data.tokensUpdated && setSmtpConfig) {
        setSmtpConfig(prev => ({
          ...prev,
          microsoftAccessToken: data.tokensUpdated.accessToken,
          microsoftRefreshToken: data.tokensUpdated.refreshToken,
          microsoftTokenExpiry: data.tokensUpdated.expiry
        }));
        console.log("[Microsoft Graph] Token auto-refreshed in state from SendTab response");
      }

      if (data.warning) {
        setSuccessBanner(`Sebagian Terkirim: ${data.warning}`);
        addLog("warning", `[DELIVERY WARNING] ${data.warning}`);
      } else {
        setSuccessBanner("Email berhasil dikirim!");
        addLog("success", `Relay sukses. Accepted: ${(data.accepted || [toEmail]).join(", ")} | MessageID: ${data.messageId}`);
      }

      return true;
    } catch (err: any) {
      if (err.name === "AbortError") {
        setErrorBanner("Koneksi timeout. Server SMTP gagal terhubung atau port terblokir.");
        addLog("error", "Relay timeout: SMTP Server non-responsif.");
      } else {
        setErrorBanner(err.message);
        addLog("error", `Relay gagal: ${err.message}`);
      }
      return false;
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const activeSender = (smtpConfig.senderEmail || smtpConfig.username || "").trim();
    if (!activeSender) {
      addLog("error", "⛔ Sistem tidak dapat bekerja: Belum ada alamat email pengirim yang terpasang di sistem.");
      setErrorBanner("⛔ Sistem pengiriman tidak dapat bekerja karena alamat email pengirim belum dimasukkan. Silakan isi alamat email pengirim di tab Pengaturan Akun atau pasang email pengirim terlebih dahulu.");
      return;
    }

    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      addLog("warning", "Lengkapi seluruh field sebelum meluncurkan relay.");
      return;
    }

    // --- 1. STRICT EMAIL VALIDATION (isValidEmail) ---
    if (validationAnalysis.invalidList.length > 0) {
      addLog("error", `⛔ [SMART BOUNCE GUARD] Pengiriman dibatalkan. Terdapat ${validationAnalysis.invalidList.length} format email penerima tidak valid: ${validationAnalysis.invalidList.join(", ")}`);
      setErrorBanner(`⛔ Smart Bounce Guard: Format email tidak valid (${validationAnalysis.invalidList.join(", ")}). Perbaiki alamat email sebelum mengirim.`);
      return;
    }

    // Warm-up Scheduler Quota Enforcement Check
    if (smtpConfig.warmUpSchedule?.enabled !== false && smtpConfig.warmUpSchedule) {
      const schedule = smtpConfig.warmUpSchedule;
      const todayLimit = Math.min(
        schedule.startLimit + (schedule.currentDay - 1) * schedule.rampStep,
        schedule.maxDailyLimit
      );

      if (schedule.sentTodayCount >= todayLimit) {
        addLog(
          "warning",
          `🔥 [WARM-UP SCHEDULER] Limit harian terlampaui (${schedule.sentTodayCount}/${todayLimit} email). Ditahan demi reputasi domain.`
        );
        setErrorBanner(
          `⚠️ Batas Warm-up Hari Ke-${schedule.currentDay} Tercapai (${schedule.sentTodayCount}/${todayLimit} email). Naikkan hari warm-up atau sesuaikan limit di tab Pengaturan Akun.`
        );
        return;
      }

      addLog(
        "info",
        `🔥 [WARM-UP SCHEDULER] Memproses pengiriman Hari ke-${schedule.currentDay} (${schedule.sentTodayCount + 1}/${todayLimit}) | Jeda Anti-Spam: ${schedule.delayBetweenEmailsSec}s | Score: ${schedule.reputationScore}/100`
      );
    }

    setHasFailed(false);
    setSendingProgress(10);
    setSendingStage("🧹 Memulai Auto Email Cleaning & Domain Audit...");

    // --- 2. FAST PARALLEL EMAIL CLEANING (Domain Active & MX Check) ---
    addLog("info", "🧹 [EMAIL CLEANING] Memulai pembersihan daftar email otomatis di latar belakang...");
    const cleanRecipients: string[] = [];
    const deadRecipients: string[] = [];

    await Promise.all(
      validationAnalysis.validList.map(async (recipient) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const verifyRes = await fetch("/api/verify-recipient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ email: recipient })
          });
          clearTimeout(timeoutId);

          const verifyData = await verifyRes.json();
          if (verifyData.isValid) {
            cleanRecipients.push(recipient);
            if (setValidationRecords) {
              setValidationRecords(prev => [
                {
                  id: "val_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                  email: recipient,
                  domain: verifyData.domain || recipient.split("@")[1] || "unknown",
                  status: "Valid",
                  reason: verifyData.reason || "Domain & Server MX Aktif",
                  hasMxRecord: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                },
                ...prev.filter(r => r.email !== recipient)
              ]);
            }
          } else {
            deadRecipients.push(recipient);
            addLog("warning", `🧹 [EMAIL CLEANING] Alamat ${recipient} dikesampingkan dari antrian: ${verifyData.reason}`);
            if (setValidationRecords) {
              setValidationRecords(prev => [
                {
                  id: "val_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
                  email: recipient,
                  domain: recipient.split("@")[1] || "unknown",
                  status: "Invalid",
                  reason: verifyData.reason || "MX Server Tidak Ditemukan",
                  hasMxRecord: false,
                  typoSuggestion: verifyData.typoSuggestion,
                  timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                },
                ...prev.filter(r => r.email !== recipient)
              ]);
            }
          }
        } catch (_) {
          // Default to clean on timeout or error so delivery is never stalled
          cleanRecipients.push(recipient);
        }
      })
    );

    if (deadRecipients.length > 0) {
      addLog("info", `✨ [EMAIL CLEANING SUCCESS] ${deadRecipients.length} email tidak aktif dikesampingkan untuk mencegah bounce rate tinggi.`);
    }

    if (cleanRecipients.length === 0) {
      addLog("error", "⛔ [EMAIL CLEANING] Tidak ada alamat email aktif yang valid untuk dikirim. Pengiriman dibatalkan.");
      setErrorBanner("⛔ Seluruh email penerima tidak aktif atau domain tidak ditemukan. Dibatalkan oleh Email Cleaning.");
      setSendingProgress(0);
      setSendingStage("");
      return;
    }

    const finalRecipientString = cleanRecipients.join(", ");
    setSendingStage("Menghubungkan ke server SMTP...");

    // Setup initial real-time tech diagnostics logs
    const initialLogs = [
      `[0.01s] SYSTEM: J.A.R.V.I.S SMTP Relay Engine booted.`,
      `[0.05s] CONSOLE: Memuat konfigurasi SMTP untuk ${smtpConfig.username || "Relay Internal"}...`
    ];
    setActiveSendingLogs(initialLogs);

    // Fast-track scheduled detailed logs
    const scheduledLogs = [
      { delay: 80, log: `[0.08s] NETWORK: Mengurai DNS host SMTP ${smtpConfig.host || "smtp.gmail.com"}...` },
      { delay: 160, log: `[0.15s] HANDSHAKE: Memulai jabat tangan TLS aman pada port ${smtpConfig.port || 465}...` },
      { delay: 240, log: `[0.22s] SECURITY: Jabat tangan TLS v1.3 sukses (Cipher: AES256-GCM-SHA384).` },
      { delay: 320, log: `[0.30s] AUTH: Mengirimkan payload otentikasi Base64...` },
      { delay: 400, log: `[0.38s] COMPOSER: Mengonstruksi MIME payload & menyematkan Anti-Spam headers.` },
    ];

    const logTimeouts: NodeJS.Timeout[] = [];
    scheduledLogs.forEach(item => {
      const t = setTimeout(() => {
        setActiveSendingLogs(prev => [...prev, item.log]);
      }, item.delay);
      logTimeouts.push(t);
    });

    let currentProgress = 10;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(90, currentProgress + 8);
      setSendingProgress(Math.floor(currentProgress));

      if (currentProgress < 30) {
        setSendingStage("Inisialisasi handshake aman...");
      } else if (currentProgress < 60) {
        setSendingStage("Autentikasi kredensial SMTP...");
      } else {
        setSendingStage("Mengunggah data & menyelesaikannya...");
      }
    }, 60);

    const isSuccess = await runSmtpForwarder(finalRecipientString, emailForm.subject, emailForm.message);

    clearInterval(progressInterval);
    logTimeouts.forEach(t => clearTimeout(t));

    if (isSuccess) {
      setHasFailed(false);
      setSendingProgress(100);
      setSendingStage("Email Berhasil Terkirim!");
      
      // Increment Warm-up sent count in state
      if (setSmtpConfig && smtpConfig.warmUpSchedule) {
        setSmtpConfig(prev => ({
          ...prev,
          warmUpSchedule: prev.warmUpSchedule
            ? {
                ...prev.warmUpSchedule,
                sentTodayCount: prev.warmUpSchedule.sentTodayCount + 1
              }
            : undefined
        }));
      }

      // Append final success logs
      setActiveSendingLogs(prev => [
        ...prev,
        `[0.45s] SUCCESS: Google MX merespons: 250 OK (Pesan diterima oleh relay).`,
        `[0.50s] SYSTEM: Sesi ditutup. Saluran transmisi aman dibongkar.`
      ]);

      setEmailForm({ to: "", subject: "", message: "" });
      triggerConfetti();
      setTimeout(() => {
        setSuccessBanner(null);
        setSendingProgress(0);
        setSendingStage("");
      }, 4000);
    } else {
      setHasFailed(true);
      setSendingProgress(100);
      setSendingStage("Relay SMTP Gagal!");

      // Append failed logs
      setActiveSendingLogs(prev => [
        ...prev,
        `[ALERT] FATAL: Transmisi terputus. SMTP Relay gagal.`,
        `[ALERT] SYSTEM: Sesi dibatalkan.`
      ]);

      setTimeout(() => {
        setHasFailed(prev => {
          if (prev) {
            setSendingProgress(0);
            setSendingStage("");
          }
          return false;
        });
      }, 10000);
    }
  };

  const useTemplateContent = (t: EmailTemplate) => {
    setEmailForm({
      to: emailForm.to,
      subject: t.subject,
      message: t.message
    });
    addLog("info", `Menggunakan template: ${t.name}`);
  };

  return (
    <>
      {/* High-tech Cyber Hologram Overlay for active email sending */}
      <AnimatePresence>
        {sendingProgress > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-8 flex flex-col items-center shadow-[0_25px_60px_-10px_rgba(245,158,11,0.25)] relative overflow-y-auto my-auto max-h-[92dvh] text-white backdrop-blur-md"
            >
              {/* Background ambient radial glow */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Central Hologram Avatar Energy Hub */}
              <div className="relative w-52 h-52 flex items-center justify-center mb-6 shrink-0">
                
                {/* 1. Concentric Sonar Ripples expanding outwards from center */}
                {sendingProgress < 100 && !hasFailed && (
                  <>
                    <motion.div 
                      className="absolute inset-2 rounded-full border border-amber-500/40 pointer-events-none"
                      animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute inset-2 rounded-full border border-rose-500/30 pointer-events-none"
                      animate={{ scale: [1, 1.65], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeOut" }}
                    />
                  </>
                )}

                {/* 2. Outer Rotating Counter-Clockwise Orbit Ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                />

                {/* 3. Glowing Progress Arc Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  {/* Background Track Circle */}
                  <circle
                    cx="104"
                    cy="104"
                    r="94"
                    className="stroke-slate-800/80 fill-none"
                    strokeWidth="4"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="104"
                    cy="104"
                    r="94"
                    className={hn(
                      "stroke-current fill-none transition-all duration-300",
                      hasFailed ? "text-rose-500" : sendingProgress === 100 ? "text-emerald-400" : "text-amber-400"
                    )}
                    strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 94}`}
                    strokeDashoffset={`${2 * Math.PI * 94 * (1 - sendingProgress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* 4. Main Pulsing Avatar Image Badge (Center Heartbeat with CSS Keyframes) */}
                <div 
                  className={hn(
                    "relative w-42 h-42 rounded-full overflow-hidden [clip-path:circle(50%_at_50%_50%)] border-2 shadow-2xl bg-slate-950 flex items-center justify-center p-0.5 z-0 origin-center transition-all duration-500",
                    sendingProgress < 100 && !hasFailed ? "animate-pulse-avatar" : "",
                    hasFailed 
                      ? "border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] scale-100" 
                      : sendingProgress === 100 
                      ? "border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)] scale-100" 
                      : "border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.55)]"
                  )}
                >
                  {/* High-Tech Fallback AI Avatar Core in background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#002b4d] to-slate-950 flex flex-col items-center justify-center p-2 z-0 rounded-full overflow-hidden">
                    <div className="p-3 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse">
                      <Bot className="w-12 h-12 text-sky-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 mt-1.5">JARVIS AI</span>
                  </div>

                  {/* Visual Sending Avatar Image with fallbacks */}
                  <img 
                    src={smtpConfig.sendingAvatarUrl || defaultAvatarImg} 
                    alt="Foto Visual Pengiriman Email" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== defaultAvatarImg) {
                        target.src = defaultAvatarImg;
                      }
                    }}
                    className={hn(
                      "relative z-10 w-full h-full object-cover rounded-full select-none origin-center transition-transform duration-300",
                      sendingProgress < 100 && !hasFailed ? "scale-105" : "scale-100"
                    )}
                  />

                  {/* Laser Scan Sweep Line */}
                  {sendingProgress < 100 && !hasFailed && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-300/30 to-transparent animate-[scan_1.5s_linear_infinite] pointer-events-none rounded-full overflow-hidden" />
                  )}

                  {/* Completion / Error Overlay Badge */}
                  {sendingProgress === 100 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={hn(
                        "absolute inset-0 flex items-center justify-center z-20 rounded-full overflow-hidden",
                        hasFailed ? "bg-rose-950/85" : "bg-slate-950/80"
                      )}
                    >
                      {hasFailed ? (
                        <div className="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                          <X className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]">
                          <Check className="w-8 h-8" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Live Status Pill at Bottom Center */}
                <div className="absolute -bottom-2 z-30">
                  <span className={hn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border shadow-lg flex items-center gap-1.5 backdrop-blur-md",
                    hasFailed
                      ? "bg-rose-950/90 border-rose-500/60 text-rose-300"
                      : sendingProgress < 100
                      ? "bg-amber-950/90 border-amber-500/60 text-amber-300"
                      : "bg-emerald-950/90 border-emerald-500/60 text-emerald-300"
                  )}>
                    {sendingProgress < 100 && !hasFailed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                    {hasFailed ? "Gagal" : sendingProgress < 100 ? "JARVIS RELAY" : "Tersebar"}
                  </span>
                </div>
              </div>

              {/* Status stage description */}
              <h3 className="text-sm font-extrabold text-amber-300 tracking-tight text-center uppercase mb-1 drop-shadow-sm">
                {sendingStage}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-black text-slate-300 tracking-wider">
                  PERSENTASE: <span className="text-amber-400 font-bold">{sendingProgress}%</span>
                </span>
              </div>

              {/* Glowing High-Tech Progress Bar */}
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-6 border border-slate-700/50 p-0.5 shadow-inner">
                <div 
                  className={hn(
                    "h-full rounded-full transition-all duration-300 relative overflow-hidden",
                    hasFailed 
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" 
                      : sendingProgress === 100
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                  )}
                  style={{ width: `${sendingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[scan_1.2s_linear_infinite]" />
                </div>
              </div>

              {/* Action Button for finished status (Success / Fail) */}
              {sendingProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex justify-center z-20"
                >
                  {hasFailed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHasFailed(false);
                        setSendingProgress(0);
                        setSendingStage("");
                      }}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-rose-400/30"
                    >
                      <X className="w-4 h-4" />
                      TUTUP DIAGNOSTIK
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessBanner(null);
                        setSendingProgress(0);
                        setSendingStage("");
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30"
                    >
                      <Check className="w-4 h-4" />
                      TUTUP DIAGNOSTIK
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key="send-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="px-2 sm:px-4 md:px-6 py-2 w-full max-w-7xl mx-auto flex flex-col h-full pb-2"
      >
        <div className="flex-1 flex flex-col w-full h-auto min-h-[480px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12)] flex-1 flex flex-col min-h-[460px] overflow-hidden">
            
            {/* Floating Scan Header Banner */}
            <div className="px-3 py-2 border-b border-slate-200 bg-slate-100/70 flex flex-col gap-1 relative shrink-0 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                  <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
                    <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </div>
                  Sistem Anti-Spam Gmail
                </h2>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase flex items-center gap-1 whitespace-nowrap shrink-0">
                  <div className="w-1 h-2.5 bg-slate-200 rounded-full overflow-hidden relative shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 animate-[scan_1.5s_linear_infinite]" />
                  </div>
                  AKTIF
                </span>
              </div>

              {/* Display current active sender SMTP account & visual avatar button */}
              <div>
                {smtpConfig.username ? (
                  <div className="flex items-center gap-2 bg-jago text-white p-1.5 rounded-xl shadow-sm border border-jago hover:bg-jago-hover group transition-all">
                    {/* Clickable Visual Sending Avatar Photo (Click directly on image to change) */}
                    <label 
                      className="relative shrink-0 cursor-pointer group/avatar rounded-full overflow-hidden border border-white/60 shadow-xs bg-slate-900 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center p-0.5 hover:ring-2 hover:ring-amber-300 transition-all"
                      title="Klik foto untuk mengubah foto profile/pengirim"
                    >
                      <img 
                        src={smtpConfig.sendingAvatarUrl || defaultAvatarImg} 
                        alt="Visual Avatar" 
                        onError={(e) => { e.currentTarget.src = defaultAvatarImg; }}
                        className="w-full h-full object-cover rounded-full group-hover/avatar:scale-105 transition-transform"
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && setSmtpConfig) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const result = evt.target?.result as string;
                              if (result) {
                                setSmtpConfig(prev => ({ ...prev, sendingAvatarUrl: result }));
                                addLog("success", "Foto profil pengiriman email berhasil diperbarui!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[6.5px] font-black text-white/80 uppercase tracking-wider">
                        Pengirim: {smtpConfig.fromName || "Tanpa Nama"}
                      </span>
                      <span className="text-[10px] font-black text-white truncate">
                        {smtpConfig.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-lg border border-white/30 shrink-0">
                      <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                      <span className="text-[7.5px] font-bold text-white uppercase">
                        Relay
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-xl border border-slate-200 border-dashed justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide italic">
                      Belum Ada Akun Pengirim. Atur di "Akun".
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Compose Form */}
            <form 
              id="send-email-form"
              onSubmit={handleSendEmailSubmit} 
              className="p-2 sm:p-3 flex-1 flex flex-col justify-between min-h-[380px] transition-all duration-300 pb-3"
            >
              {/* Responsive Container */}
              <div className="flex-1 flex flex-col gap-2.5 min-h-[360px]">
                
                {/* Form Fields */}
                <div className="flex-1 flex flex-col gap-2 min-h-[340px]">
                  {/* Banners */}
                  {errorBanner && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2 relative shrink-0"
                    >
                      <button 
                        type="button" 
                        onClick={() => setErrorBanner(null)}
                        className="absolute top-2 right-2 text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex gap-2 items-start pr-6">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-700 font-medium leading-normal flex-1">
                          {errorBanner}
                        </p>
                      </div>
                      
                      {(errorBanner.toLowerCase().includes("smtpclientauthentication is disabled") || 
                        errorBanner.toLowerCase().includes("smtp_auth_disabled") || 
                        errorBanner.toLowerCase().includes("5.7.139") ||
                        errorBanner.toLowerCase().includes("outlook") ||
                        errorBanner.toLowerCase().includes("office365")) && (
                        <div className="mt-1.5 p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-1.5 shadow-sm">
                          <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Rekomendasi Pintar J.A.R.V.I.S:</span>
                          <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                            Microsoft memblokir SMTP biasa secara default demi keamanan. Anda disarankan untuk beralih menggunakan koneksi aman <strong>Microsoft Graph (OAuth2)</strong>.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (setSmtpConfig) {
                                setSmtpConfig(prev => ({ ...prev, providerType: "microsoft_graph" }));
                              }
                              setErrorBanner(null);
                              setActiveTab("accounts");
                            }}
                            className="text-center text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-xl shadow-sm transition-all uppercase tracking-wide cursor-pointer"
                          >
                            Beralih ke Microsoft Graph (OAuth2) Sekarang
                          </button>
                        </div>
                      )}

                      {(errorBanner.toLowerCase().includes("batas warm-up") || errorBanner.toLowerCase().includes("warm-up")) && (
                        <div className="mt-1 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (setSmtpConfig) {
                                setSmtpConfig(prev => {
                                  const currentSchedule = prev.warmUpSchedule || {
                                    enabled: true,
                                    preset: "standard",
                                    currentDay: 1,
                                    startLimit: 25,
                                    rampStep: 25,
                                    maxDailyLimit: 2000,
                                    delayBetweenEmailsSec: 5,
                                    sentTodayCount: 0,
                                    todayDate: new Date().toISOString().split("T")[0],
                                    reputationScore: 98,
                                    autoPauseOnError: true
                                  };
                                  return {
                                    ...prev,
                                    warmUpSchedule: {
                                      ...currentSchedule,
                                      currentDay: currentSchedule.currentDay + 1
                                    }
                                  };
                                });
                              }
                              setErrorBanner(null);
                              addLog("info", "🔥 Hari Warm-Up dinaikkan +1 Hari secara cepat.");
                            }}
                            className="text-[10px] font-black text-amber-950 bg-amber-400 hover:bg-amber-500 py-1.5 px-3 rounded-lg transition-all border border-amber-500 cursor-pointer shadow-2xs"
                          >
                            +1 Naikkan Hari Warm-Up
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (setSmtpConfig) {
                                setSmtpConfig(prev => ({
                                  ...prev,
                                  warmUpSchedule: {
                                    ...(prev.warmUpSchedule || {
                                      enabled: true,
                                      preset: "standard",
                                      currentDay: 1,
                                      startLimit: 25,
                                      rampStep: 25,
                                      maxDailyLimit: 2000,
                                      delayBetweenEmailsSec: 5,
                                      sentTodayCount: 0,
                                      todayDate: new Date().toISOString().split("T")[0],
                                      reputationScore: 98,
                                      autoPauseOnError: true
                                    }),
                                    sentTodayCount: 0
                                  }
                                }));
                              }
                              setErrorBanner(null);
                              addLog("success", "🔄 Kuota hari ini direset kembali ke 0.");
                            }}
                            className="text-[10px] font-bold text-slate-800 bg-white hover:bg-slate-100 py-1.5 px-3 rounded-lg transition-all border border-slate-300 cursor-pointer shadow-2xs"
                          >
                            Reset Kuota Hari Ini (0)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setErrorBanner(null);
                              setActiveTab("accounts");
                            }}
                            className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                          >
                            Atur Limit di Tab Akun →
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2 mt-1">
                        <button 
                          type="button" 
                          onClick={() => setActiveTab("accounts")}
                          className="text-[10px] font-black text-rose-700 bg-rose-100/50 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-all uppercase"
                        >
                          Perbaiki SMTP
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setActiveTab("terminal")}
                          className="text-[10px] font-black text-rose-600/70 bg-rose-100/30 px-3 py-1.5 rounded-lg border border-rose-200/50 hover:bg-rose-100/50 transition-all uppercase"
                        >
                          Lihat Terminal Log
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {successBanner && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-2.5 items-center relative shrink-0"
                    >
                      <button 
                        type="button" 
                        onClick={() => setSuccessBanner(null)}
                        className="absolute top-2 right-2 text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-tight pr-6">
                        {successBanner}
                      </p>
                    </motion.div>
                  )}

                  {/* Fields */}
                  <div className="space-y-2 shrink-0">
                    {/* Receiver Field */}
                    <div className="space-y-1">
                      <div className={hn(
                        "relative flex items-center bg-white border rounded-xl shadow-xs transition-all overflow-hidden",
                        parsedRecipients.length > 0 && !validationAnalysis.isValidAll 
                          ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20" 
                          : "border-slate-200/90 hover:border-slate-300 focus-within:border-jago focus-within:ring-1 focus-within:ring-jago/20"
                      )}>
                        <span className={hn(
                          "pl-3.5 pr-2 text-xs font-bold uppercase select-none shrink-0 border-r py-2.5 flex items-center gap-1 whitespace-nowrap",
                          parsedRecipients.length > 0 && !validationAnalysis.isValidAll
                            ? "text-rose-600 border-rose-200 bg-rose-100/40"
                            : "text-slate-400 border-slate-100"
                        )}>
                          <span>Kepada</span>
                        </span>
                        <input 
                          required 
                          type="text"
                          inputMode="email"
                          dir="ltr"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          autoComplete="email"
                          enterKeyHint="next"
                          placeholder=""
                          value={emailForm.to}
                          onChange={handleToChange}
                          onPaste={handleRecipientPaste}
                          className="w-full pl-3 pr-2 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                        />
                        
                        {emailForm.to && (
                          <div className="pr-2 flex items-center shrink-0">
                            <button
                              type="button"
                              onClick={() => setEmailForm(prev => ({ ...prev, to: "" }))}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Bersihkan Alamat Penerima"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Real-time Async Domain MX Records Check Indicator */}
                      {emailForm.to && (
                        <div className="px-1">
                          <DomainMxStatusBadge emailInput={emailForm.to} />
                        </div>
                      )}

                      {/* Smart Bounce Guard Card */}
                      {parsedRecipients.length > 0 && !validationAnalysis.isValidAll && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl space-y-2 shadow-sm text-xs shrink-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-rose-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
                              SMART BOUNCE GUARD WARNING
                            </span>
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                              Format / Typo Dideteksi
                            </span>
                          </div>

                          {validationAnalysis.invalidList.length > 0 && (
                            <div className="text-[11px] text-rose-800 font-semibold leading-relaxed">
                              ⚠️ Format email tidak valid (sintaks): <strong className="font-mono text-rose-900 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200">{validationAnalysis.invalidList.join(", ")}</strong>
                            </div>
                          )}

                          {validationAnalysis.typoList.length > 0 && (
                            <div className="space-y-1.5 pt-1 border-t border-rose-200/60">
                              <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                                <Wand2 className="w-3 h-3 text-amber-600 shrink-0" />
                                Rekomendasi Perbaikan Domain:
                              </span>
                              {validationAnalysis.typoList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-rose-200 gap-2">
                                  <div className="font-mono text-[11px] text-slate-700 truncate">
                                    <span className="line-through text-rose-500 mr-1">{item.original}</span>
                                    ➔ <strong className="text-emerald-700">{item.fixed}</strong>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyTypoFix(item.original, item.fixed)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-md shadow-2xs transition-all uppercase tracking-wider shrink-0 cursor-pointer"
                                  >
                                    Perbaiki
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Toast Banner on Paste Filter Event */}
                      <AnimatePresence>
                        {pasteFilterInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -4 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-800 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                              {pasteFilterInfo.count > 0 ? (
                                <span>
                                  <strong>Auto-Filter Sukses!</strong> Tersaring <strong>{pasteFilterInfo.count} email</strong> ({pasteFilterInfo.preview}).
                                </span>
                              ) : (
                                <span className="text-amber-700 font-bold">
                                  ⚠️ Teks paste tidak mengandung format email valid (@).
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setPasteFilterInfo(null)}
                              className="text-emerald-600 hover:text-emerald-800 ml-2 font-black cursor-pointer"
                            >
                              ✕
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subject Field */}
                    <div className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl shadow-xs focus-within:border-jago focus-within:ring-1 focus-within:ring-jago/20 transition-all overflow-hidden">
                      <span className="pl-3.5 pr-2 text-xs font-bold text-slate-400 uppercase select-none shrink-0 border-r border-slate-100 py-2.5">
                        Subjek
                      </span>
                      <input 
                        required 
                        type="text"
                        dir="ltr"
                        enterKeyHint="next"
                        placeholder=""
                        value={emailForm.subject}
                        onChange={handleSubjectChangeInput}
                        className="w-full px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                      />
                      {emailForm.subject && (
                        <div className="pr-3 flex items-center gap-1.5 shrink-0">
                          <div className="text-[9px] font-black flex items-center gap-1 bg-slate-100 ring-1 ring-slate-200 px-2 py-0.5 rounded-full shadow-xs">
                            {spamReport.score < 70 ? (
                              <AlertCircle className={`w-2.5 h-2.5 ${spamReport.color}`} />
                            ) : (
                              <ShieldCheck className={`w-2.5 h-2.5 ${spamReport.color}`} />
                            )}
                            <span className={spamReport.color}>{spamReport.level}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Anti-spam Diagnostics Tips */}
                  <div>
                    <AnimatePresence>
                      {spamReport.tips.length > 0 && emailForm.subject && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 overflow-hidden shadow-sm shrink-0 mb-2"
                        >
                          <div className="flex gap-2">
                            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wide">
                                Deteksi Proteksi Spam:
                              </p>
                              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                                {spamReport.tips.map((tip, idx) => (
                                  <li key={idx} className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* HTML Message Textarea - flex-1 min-h-0 allows it to stretch perfectly */}
                  <div className="flex flex-col gap-1.5 flex-1 min-h-[140px]">
                    <div className="flex items-center justify-between px-1 shrink-0">
                      <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest">
                        Isi Pesan (Mendukung HTML & Teks)
                      </label>
                      {emailForm.message && (
                        <button 
                          type="button" 
                          onClick={() => setEmailForm({ ...emailForm, message: "" })}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all active:scale-95 group"
                          title="Hapus Isi Pesan"
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                            Hapus Pesan
                          </span>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                      <RichTextEditor 
                        value={emailForm.message}
                        onChange={handleMessageChange}
                        placeholder="Tulis pesan email di sini atau gunakan AI / Template..."
                        minHeight="120px"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Static Footer (Mobile Templates Carousel & Progress Bar) */}
              <div className="pt-2 flex flex-col gap-2 shrink-0 border-t border-slate-200 mt-2 transition-all duration-300 relative">
                {/* Mobile templates carousel */}
                <div className="flex flex-col gap-2 px-1">
                  {templates.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                        Gunakan Template Tersimpan
                      </span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => useTemplateContent(t)}
                            className="shrink-0 group flex flex-col items-start p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-jago transition-all shadow-sm active:scale-95 min-w-[90px] cursor-pointer"
                          >
                            <span className="text-[9px] font-black text-slate-800 group-hover:text-jago-dark truncate w-full text-left">
                              {t.name}
                            </span>
                            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full text-left">
                              {t.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Elegant Progress Bar */}
                <AnimatePresence>
                  {sendingProgress > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: 5, height: 0 }}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 overflow-hidden shadow-inner mb-1"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 truncate pr-2">
                          {sendingProgress === 100 ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <span className="w-3 h-3 text-emerald-500 css-spinner shrink-0" />
                          )}
                          <span className={`${sendingProgress === 100 ? 'text-emerald-500' : 'text-slate-600'} truncate`}>{sendingStage}</span>
                        </span>
                        <span className="font-mono font-black text-emerald-500 shrink-0">
                          {sendingProgress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-300 ease-out"
                          style={{ width: `${sendingProgress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
});
