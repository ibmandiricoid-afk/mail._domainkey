/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import jarvisBg from "./assets/images/jarvis_cool_background_1783882128944.jpg";
import { 
  KeyRound, LogOut, ChevronLeft, Sparkles
} from "lucide-react";

import { EmailTemplate, SmtpConfig, LogEntry, BankingNotification, EmailValidationRecord } from "./types";
import { SendTab } from "./components/SendTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { TerminalTab } from "./components/TerminalTab";
import { AccountsTab, ZohoSmtpIcon } from "./components/AccountsTab";
import { AiCopilotWidget } from "./components/AiCopilotWidget";
import { LoginView } from "./components/LoginView";
import { AppBottomNav } from "./components/AppBottomNav";
import { NotificationToastStack } from "./components/NotificationToastStack";
import { TemplateFormModal } from "./components/modals/TemplateFormModal";
import { TemplatePreviewModal } from "./components/modals/TemplatePreviewModal";
import { DeleteConfirmModal } from "./components/modals/DeleteConfirmModal";
import { QuickTestModal } from "./components/modals/QuickTestModal";
import { PasscodeModal } from "./components/modals/PasscodeModal";
import { hn } from "./lib/utils";
import { motion } from "motion/react";

export default function App() {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Remove any persistent legacy key so re-opening the app or new tabs strictly require PIN authentication
    localStorage.removeItem("admin_logged_in");
    return sessionStorage.getItem("admin_logged_in") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [savedPasscode, setSavedPasscode] = useState(() => {
    const saved = localStorage.getItem("app_passcode");
    if (saved && /^\d{6}$/.test(saved)) return saved;
    return "030819";
  });

  // --- Passcode Change States ---
  const [currentPasscodeForm, setCurrentPasscodeForm] = useState("");
  const [newPasscodeForm, setNewPasscodeForm] = useState("");
  const [confirmPasscodeForm, setConfirmPasscodeForm] = useState("");
  const [passcodeChangeError, setPasscodeChangeError] = useState<string | null>(null);
  const [passcodeChangeSuccess, setPasscodeChangeSuccess] = useState<string | null>(null);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  // --- Auto-Lock Timeout Config ---
  const [autoLockTimeout, setAutoLockTimeout] = useState<"1min" | "5min" | "15min" | "30min" | "never">(() => {
    const saved = localStorage.getItem("auto_lock_timeout");
    if (saved && ["1min", "5min", "15min", "30min", "never"].includes(saved)) {
      return saved as any;
    }
    return "5min";
  });

  useEffect(() => {
    localStorage.setItem("auto_lock_timeout", autoLockTimeout);
  }, [autoLockTimeout]);

  // --- Navigation & Core Views ---
  const [activeTab, setActiveTab] = useState<"send" | "templates" | "terminal" | "accounts">("send");

  // --- Email Tracking State ---
  const [bankingNotifications, setBankingNotifications] = useState<BankingNotification[]>([]);

  // --- Historical Email Validation Tracking State ---
  const [validationRecords, setValidationRecords] = useState<EmailValidationRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("email_validation_records");
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: "val_1",
        email: "official.client@gmail.com",
        domain: "gmail.com",
        status: "Valid",
        reason: "Domain & Server MX Aktif. Siap Menerima Email.",
        hasMxRecord: true,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      },
      {
        id: "val_2",
        email: "finance.dept@gmaill.com",
        domain: "gmaill.com",
        status: "Invalid",
        reason: "Domain Typo / MX Record Tidak Ditemukan",
        hasMxRecord: false,
        typoSuggestion: "finance.dept@gmail.com",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      },
      {
        id: "val_3",
        email: "user@tempmail.org",
        domain: "tempmail.org",
        status: "Unknown",
        reason: "Domain Sekali Pakai (Disposable) Dikesampingkan",
        hasMxRecord: false,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("email_validation_records", JSON.stringify(validationRecords));
    } catch (_) {}
  }, [validationRecords]);

  // --- Visual Celebration Effects States ---
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);

  // --- Streaming Terminal Logs ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logQueueRef = useRef<LogEntry[]>([]);
  const logBatchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with state when manually cleared
  useEffect(() => {
    if (logs.length === 0) {
      logQueueRef.current = [];
    }
  }, [logs]);

  // --- Templates CRUD & Modal ---
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem("email_templates");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "General" as const,
    subject: "",
    message: ""
  });

  const handleTemplateMessageChange = useCallback((val: string) => {
    setTemplateForm((prev) => ({ ...prev, message: val }));
  }, []);

  // --- Preview & Quick-Test Modals ---
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [quickTestTemplate, setQuickTestTemplate] = useState<EmailTemplate | null>(null);
  const [quickTestRecipient, setQuickTestRecipient] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  // --- AI Assistant Toggle State ---
  const [isAiOpen, setIsAiOpen] = useState(false);

  // --- SMTP Configuration State ---
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    const defaultLogo = "";
    const saved = localStorage.getItem("relay_smtp_config") || localStorage.getItem("smtp_account");
    const defaultSignature = '<p style="font-size:12px; color:#475569; margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; font-family:sans-serif;">Hormat kami,<br><strong style="color:#0f172a;">Tim Operasional &amp; Layanan</strong><br><span style="color:#64748b; font-size:11px;">Official Relay Notification System</span></p>';
    const defaultWarmUp = {
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

    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.logoUrl === undefined) {
        parsed.logoUrl = defaultLogo;
      }
      if (parsed.emailSignature === undefined) {
        parsed.emailSignature = defaultSignature;
      }
      if (parsed.enableSignature === undefined) {
        parsed.enableSignature = true;
      }
      if (parsed.unsubscribeUrl === undefined) {
        parsed.unsubscribeUrl = "";
      }
      if (!parsed.warmUpSchedule) {
        parsed.warmUpSchedule = defaultWarmUp;
      } else {
        // Daily reset check
        const todayStr = new Date().toISOString().split("T")[0];
        if (parsed.warmUpSchedule.todayDate !== todayStr) {
          parsed.warmUpSchedule.todayDate = todayStr;
          parsed.warmUpSchedule.sentTodayCount = 0;
        }
      }
      return parsed;
    }
    return {
      host: "smtp.gmail.com",
      port: "587",
      username: "",
      password: "",
      senderEmail: "",
      fromName: "Operational Team",
      replyTo: "",
      dailyLimit: "200",
      connectionType: "STARTTLS",
      logoUrl: defaultLogo,
      emailSignature: defaultSignature,
      enableSignature: true,
      unsubscribeUrl: "",
      warmUpSchedule: defaultWarmUp,
      providerType: "smtp",
      microsoftClientId: "",
      microsoftClientSecret: "",
      microsoftTenantId: "common",
      microsoftAuthType: "auth_code",
      microsoftAccessToken: "",
      microsoftRefreshToken: "",
      microsoftTokenExpiry: 0
    };
  });

  // Auto-persist smtpConfig to localStorage when changed
  useEffect(() => {
    localStorage.setItem("relay_smtp_config", JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  // Handle global banking-notif event with auto-dismiss
  useEffect(() => {
    const handleBankingNotif = (e: Event) => {
      const customEvt = e as CustomEvent<BankingNotification>;
      if (customEvt.detail) {
        const id = customEvt.detail.id || String(Date.now() + Math.random());
        const newNotif = { ...customEvt.detail, id };
        setBankingNotifications(prev => [newNotif, ...prev]);

        // Auto-dismiss after 3.5 seconds
        setTimeout(() => {
          setBankingNotifications(prev => prev.filter(n => n.id !== id));
        }, 3500);
      }
    };
    window.addEventListener("banking-notif", handleBankingNotif);
    return () => window.removeEventListener("banking-notif", handleBankingNotif);
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    const colors = ["#fbbf24", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6", "#f43f5e", "#00ffff"];
    const shapes = ["circle", "star", "square", "triangle"];
    const particles = Array.from({ length: 80 }).map((_, i) => {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const velocity = Math.random() * 15 + 10;
      return {
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: Math.random() * 12 + 6,
        rotate: Math.random() * 360,
        rotateSpeed: (Math.random() - 0.5) * 15,
        duration: Math.random() * 2 + 1.5,
        delay: Math.random() * 0.1,
      };
    });
    setConfettiParticles(particles);
    setTimeout(() => {
      setShowConfetti(false);
      setConfettiParticles([]);
    }, 4000);
  }, []);

  const addLog = useCallback((type: "info" | "success" | "error" | "warning", msg: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newEntry = { timestamp, type, message: msg };
    
    logQueueRef.current.push(newEntry);
    
    if (logQueueRef.current.length > 30) {
      logQueueRef.current = logQueueRef.current.slice(-30);
    }

    if (!logBatchTimeoutRef.current) {
      logBatchTimeoutRef.current = setTimeout(() => {
        setLogs([...logQueueRef.current]);
        logBatchTimeoutRef.current = null;
      }, 60);
    }
  }, []);

  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  const checkBackendHealth = useCallback(async (isSilent = false) => {
    try {
      const res = await fetch("/api/health");
      const contentType = res.headers.get("content-type");
      
      if (!res.ok) {
        const text = await res.text();
        if (!isSilent) addLog("error", `API Connection Error (${res.status}): ${text.substring(0, 30)}...`);
        setIsBackendConnected(false);
        return false;
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setIsBackendConnected(true);
        if (!isSilent && (data.smtp_configured || smtpConfig.username)) {
          addLog("success", "Koneksi Relay terjalin.");
        }
        return true;
      } else {
        if (!isSilent) addLog("error", "Respons API tidak valid (Bukan JSON).");
        setIsBackendConnected(false);
        return false;
      }
    } catch {
      if (!isSilent) addLog("error", "API tidak terjangkau. Server sedang restart atau belum siap.");
      setIsBackendConnected(false);
      return false;
    }
  }, [addLog, smtpConfig.username]);

  // Initial Bootup Connection Diagnostics & Periodic Polling
  const hasLoggedInit = useRef(false);
  useEffect(() => {
    if (!hasLoggedInit.current) {
      addLog("info", "J.A.R.V.I.S Relay active. System ready.");
      checkBackendHealth(false);
      hasLoggedInit.current = true;
    }
    const healthInterval = setInterval(() => {
      checkBackendHealth(true); // Silent background polling
    }, 25000);
    return () => clearInterval(healthInterval);
  }, [checkBackendHealth]);

  // Auto-verify PIN when it reaches 6 digits
  useEffect(() => {
    if (!isLoggedIn && passcode.length === 6) {
      if (passcode === savedPasscode) {
        setIsLoggedIn(true);
        sessionStorage.setItem("admin_logged_in", "true");
        setPasscodeError(false);
      } else {
        setPasscodeError(true);
        const timer = setTimeout(() => {
          setPasscode("");
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [passcode, savedPasscode, isLoggedIn]);

  // --- Smart Auto-Lock Engine: Grace Period on App Switch / Tab Hide ---
  const lastHiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleLockApp = () => {
      setIsLoggedIn(false);
      setPasscode("");
      sessionStorage.removeItem("admin_logged_in");
      localStorage.removeItem("admin_logged_in");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        if (lastHiddenTimeRef.current && isLoggedIn) {
          const hiddenDurationMs = Date.now() - lastHiddenTimeRef.current;
          
          let timeoutMs = 5 * 60 * 1000; // default 5 minutes
          if (autoLockTimeout === "1min") timeoutMs = 1 * 60 * 1000;
          else if (autoLockTimeout === "5min") timeoutMs = 5 * 60 * 1000;
          else if (autoLockTimeout === "15min") timeoutMs = 15 * 60 * 1000;
          else if (autoLockTimeout === "30min") timeoutMs = 30 * 60 * 1000;
          else if (autoLockTimeout === "never") timeoutMs = Infinity;

          if (hiddenDurationMs >= timeoutMs) {
            addLog("info", `🔒 [Auto-Lock] Aplikasi dikunci otomatis setelah tidak aktif selama > ${autoLockTimeout}.`);
            handleLockApp();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleLockApp);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleLockApp);
    };
  }, [autoLockTimeout, isLoggedIn, addLog]);

  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeChangeError(null);
    setPasscodeChangeSuccess(null);

    if (currentPasscodeForm !== savedPasscode) {
      setPasscodeChangeError("PIN saat ini tidak benar.");
      addLog("error", "Gagal mengganti PIN: PIN lama salah.");
      return;
    }

    if (!newPasscodeForm) {
      setPasscodeChangeError("PIN baru tidak boleh kosong.");
      return;
    }

    if (!/^\d{6}$/.test(newPasscodeForm)) {
      setPasscodeChangeError("PIN baru harus berupa 6 digit angka.");
      addLog("error", "Gagal mengganti PIN: PIN harus 6 digit angka.");
      return;
    }

    if (newPasscodeForm !== confirmPasscodeForm) {
      setPasscodeChangeError("Konfirmasi PIN baru tidak cocok.");
      return;
    }

    localStorage.setItem("app_passcode", newPasscodeForm);
    setSavedPasscode(newPasscodeForm);
    setPasscodeChangeSuccess("PIN keamanan berhasil diperbarui!");
    addLog("success", "PIN keamanan panel berhasil diubah.");
    
    setCurrentPasscodeForm("");
    setNewPasscodeForm("");
    setConfirmPasscodeForm("");
  };

  const deleteTemplate = useCallback((id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("email_templates", JSON.stringify(updated));
    addLog("warning", "Template berhasil dihapus.");
  }, [templates, addLog]);

  const handleSuggestCategory = useCallback(async () => {
    if (!templateForm.subject && !templateForm.message) {
      return;
    }
    setIsSuggestingCategory(true);
    addLog("info", "Sedang menganalisis konten template untuk rekomendasi kategori...");
    try {
      const res = await fetch("/api/gemini/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: templateForm.subject,
          message: templateForm.message
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.category) {
          setTemplateForm((prev) => ({ ...prev, category: data.category }));
          addLog("success", `AI merekomendasikan kategori: ${data.category}`);
        } else {
          addLog("warning", "Gagal mendapatkan rekomendasi kategori dari AI.");
        }
      } else {
        addLog("warning", "Gagal menghubungi modul klasifikasi AI.");
      }
    } catch (err: any) {
      console.error(err);
      addLog("error", "Error mendeteksi rekomendasi kategori otomatis.");
    } finally {
      setIsSuggestingCategory(false);
    }
  }, [templateForm.subject, templateForm.message, addLog]);

  const handleSaveTemplateSubmit = useCallback(() => {
    if (!templateForm.name || !templateForm.subject || !templateForm.message) {
      return;
    }

    if (editingTemplateId) {
      const updated = templates.map((t) =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: templateForm.name,
              category: templateForm.category,
              subject: templateForm.subject,
              message: templateForm.message
            }
          : t
      );
      setTemplates(updated);
      localStorage.setItem("email_templates", JSON.stringify(updated));
      addLog("info", `Template "${templateForm.name}" diperbarui.`);
    } else {
      const newTemplate: EmailTemplate = {
        id: Math.random().toString(36).substring(7),
        name: templateForm.name,
        category: templateForm.category,
        subject: templateForm.subject,
        message: templateForm.message,
        createdAt: Date.now()
      };
      const updated = [...templates, newTemplate];
      setTemplates(updated);
      localStorage.setItem("email_templates", JSON.stringify(updated));
      addLog("success", `Template "${templateForm.name}" disimpan.`);
    }

    setShowTemplateModal(false);
    setEditingTemplateId(null);
    setTemplateForm({ name: "", category: "General", subject: "", message: "" });
  }, [templates, templateForm, editingTemplateId, addLog]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setPasscode("");
    localStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_logged_in");
    addLog("warning", "Admin keluar dari sistem.");
  }, [addLog]);

  // --- RENDER 1: LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <LoginView 
        passcode={passcode}
        setPasscode={setPasscode}
        passcodeError={passcodeError}
        setPasscodeError={setPasscodeError}
        jarvisBg={jarvisBg}
      />
    );
  }

  // --- RENDER 2: MAIN SYSTEM APP ---
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 flex items-center justify-center font-sans text-slate-800 overflow-hidden relative select-none">
      {/* Locked Mobile Shell Device Frame */}
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] mx-auto bg-[#e8edf5] rounded-none sm:rounded-[40px] border-0 sm:border-[8px] border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative hardware-accelerated shrink-0">
        
        {/* Subtle Smartphone Camera Dynamic Island Notch (Desktop Preview Only) */}
        <div className="hidden sm:flex items-center justify-center h-5 bg-[#003b6d] shrink-0 z-40 relative">
          <div className="w-20 h-3 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="w-1 h-1 rounded-full bg-sky-900" />
          </div>
        </div>

        {/* --- HIGH PERFORMANCE SYSTEM BACKGROUND (GPU-OPTIMIZED) --- */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-cover bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundImage: `url(${jarvisBg})` }}
        />
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden z-[1]"
          style={{
            background: `
              radial-gradient(circle at 50% 10%, rgba(0, 175, 240, 0.08) 0%, transparent 80%),
              linear-gradient(180deg, #e4e9f2 0%, #dbe2ee 100%)
            `,
          }}
        />

        {/* --- CONFETTI CELEBRATION LAYER --- */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-[99] overflow-hidden">
            {confettiParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: "50vw", y: "45vh", scale: 0, rotate: p.rotate, opacity: 1 }}
                animate={{
                  x: `calc(50vw + ${p.vx * 24}px)`,
                  y: `calc(45vh + ${p.vy * 24 + 300}px)`,
                  rotate: p.rotate + p.rotateSpeed * 35,
                  scale: [0, 1, 1, 0.6, 0],
                  opacity: [1, 1, 1, 0.8, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.1, 0.8, 0.25, 1],
                }}
                style={{
                  position: "absolute",
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  borderRadius: p.shape === "circle" ? "50%" : p.shape === "triangle" ? "0 50% 50% 50%" : "2px",
                  boxShadow: `0 0 10px ${p.color}40`,
                }}
              />
            ))}
          </div>
        )}

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10 transition-all duration-300 pb-[calc(64px+env(safe-area-inset-bottom,0px))]">
          
          <header className="h-14 bg-gradient-to-r from-[#003b6d] via-[#005291] to-[#006bb3] border-b border-sky-400/20 px-3 flex items-center justify-between gap-2 shrink-0 shadow-lg z-30 relative text-white transition-all duration-500 ease-in-out backdrop-blur-md overflow-hidden">
            {/* Left Area (Key Button, Logout & Back Button) */}
            <div className="flex items-center gap-1 shrink-0 z-10">
              <button 
                onClick={() => {
                  setPasscodeChangeError(null);
                  setPasscodeChangeSuccess(null);
                  setShowPasscodeModal(true);
                }}
                className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer border border-white/25 shadow-sm"
                title="Ganti PIN Panel"
              >
                <KeyRound className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer border border-white/25 shadow-sm"
                title="Kunci / Keluar Panel"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
              {activeTab !== "send" && (
                <button 
                  onClick={() => setActiveTab("send")}
                  className="p-1 hover:bg-white/15 rounded-full transition-colors shrink-0 text-white cursor-pointer"
                  aria-label="Kembali"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
            
            {/* Centered Logo & Brand Text "JARVIS" (Flex Centered, Responsive) */}
            <div className="flex items-center justify-center shrink min-w-0 mx-auto z-10 px-1">
              <button 
                onClick={() => setIsAiOpen(!isAiOpen)}
                className="flex items-center gap-2 select-none hover:opacity-95 active:scale-[0.96] transition-all text-center focus:outline-none shrink min-w-0 group relative cursor-pointer"
                title="Buka Asisten AI JARVIS"
              >
                <div className="absolute -inset-1.5 rounded-xl border border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none" />
                
                <div className="w-7.5 h-7.5 bg-white/20 border border-white/40 text-white rounded-lg flex items-center justify-center shadow-sm shrink-0 relative overflow-hidden group-hover:border-white transition-all duration-300">
                  <div className="flex items-center justify-center animate-[spin_8s_linear_infinite]">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                </div>
                
                <div className="flex flex-col items-start leading-none min-w-0">
                  <span className="font-mono font-black text-white tracking-[0.18em] text-sm uppercase transition-all duration-300 drop-shadow-sm truncate">
                    JARVIS
                  </span>
                  <span className="text-[7px] font-black tracking-[0.25em] text-white/80 uppercase transition-colors duration-300 mt-0.5 whitespace-nowrap">
                    SYSTEM CORE
                  </span>
                </div>
              </button>
            </div>

            {/* Right Area (SMTP Action button with Real-time Connection Status) */}
            <div className="flex items-center gap-1 shrink-0 z-10">
              <button 
                onClick={() => {
                  checkBackendHealth();
                  setActiveTab("accounts");
                }}
                className={hn(
                  "px-2 py-1 rounded-lg text-[9.5px] font-extrabold transition-all shadow-sm uppercase cursor-pointer flex items-center gap-1.5 border shrink-0 whitespace-nowrap",
                  activeTab === "accounts" 
                    ? "bg-white text-[#005291] border-white shadow-md font-black scale-105" 
                    : "bg-white/15 hover:bg-white/25 text-white border-white/25"
                )}
                title={isBackendConnected === true ? "Status Server: Online" : isBackendConnected === false ? "Status Server: Offline" : "Memeriksa koneksi..."}
              >
                <ZohoSmtpIcon size="sm" className="w-4 h-4 shrink-0" />
                {/* Real-time Connection Status Indicator Badge */}
                <span 
                  className={hn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-black tracking-wider transition-all shrink-0 whitespace-nowrap uppercase",
                    isBackendConnected === true
                      ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : isBackendConnected === false
                      ? "bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                      : "bg-amber-500/25 text-amber-200 border border-amber-400/50"
                  )}
                >
                  <span 
                    className={hn(
                      "w-1.5 h-1.5 rounded-full animate-pulse shrink-0",
                      isBackendConnected === true
                        ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                        : isBackendConnected === false
                        ? "bg-rose-400 shadow-[0_0_6px_#f87171]"
                        : "bg-amber-400 shadow-[0_0_6px_#fbbf24]"
                    )}
                  />
                  <span>{isBackendConnected === true ? "ONLINE" : isBackendConnected === false ? "OFFLINE" : "CHECK"}</span>
                </span>
              </button>
            </div>
          </header>

          {/* --- WORKSPACE VIEW CONTROLLER --- */}
          <div className="flex-1 bg-transparent flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar lg:overflow-hidden" style={{ display: activeTab === "send" ? "flex" : "none" }}>
              <SendTab 
                smtpConfig={smtpConfig}
                setSmtpConfig={setSmtpConfig}
                templates={templates}
                setActiveTab={setActiveTab}
                addLog={addLog}
                triggerConfetti={triggerConfetti}
                validationRecords={validationRecords}
                setValidationRecords={setValidationRecords}
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ display: activeTab === "templates" ? "flex" : "none" }}>
              <TemplatesTab 
                templates={templates}
                setActiveTab={setActiveTab}
                setEditingTemplateId={setEditingTemplateId}
                setTemplateForm={setTemplateForm}
                setShowTemplateModal={setShowTemplateModal}
                setTemplateToDelete={setTemplateToDelete}
                setPreviewTemplate={setPreviewTemplate}
                setQuickTestTemplate={setQuickTestTemplate}
                setQuickTestRecipient={setQuickTestRecipient}
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ display: activeTab === "terminal" ? "flex" : "none" }}>
              <TerminalTab 
                logs={logs}
                setLogs={setLogs}
                addLog={addLog}
                smtpConfig={smtpConfig}
                setSmtpConfig={setSmtpConfig}
                validationRecords={validationRecords}
                setValidationRecords={setValidationRecords}
              />
            </div>
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ display: activeTab === "accounts" ? "flex" : "none" }}>
              <AccountsTab 
                smtpConfig={smtpConfig}
                setSmtpConfig={setSmtpConfig}
                setActiveTab={setActiveTab}
                addLog={addLog}
                triggerConfetti={triggerConfetti}
                checkBackendHealth={checkBackendHealth}
              />
            </div>
          </div>

          {/* --- GLOBAL APP MODALS CONTROLLERS --- */}
          <TemplateFormModal 
            showTemplateModal={showTemplateModal}
            editingTemplateId={editingTemplateId}
            templateForm={templateForm}
            setTemplateForm={setTemplateForm}
            isSuggestingCategory={isSuggestingCategory}
            handleSuggestCategory={handleSuggestCategory}
            handleSaveTemplateSubmit={handleSaveTemplateSubmit}
            onClose={() => {
              setShowTemplateModal(false);
              setEditingTemplateId(null);
              setTemplateForm({ name: "", category: "General", subject: "", message: "" });
            }}
            handleTemplateMessageChange={handleTemplateMessageChange}
          />

          <TemplatePreviewModal 
            previewTemplate={previewTemplate}
            setPreviewTemplate={setPreviewTemplate}
            setActiveTab={setActiveTab}
          />

          <DeleteConfirmModal 
            templateToDelete={templateToDelete}
            setTemplateToDelete={setTemplateToDelete}
            deleteTemplate={deleteTemplate}
          />

          <QuickTestModal 
            quickTestTemplate={quickTestTemplate}
            setQuickTestTemplate={setQuickTestTemplate}
            quickTestRecipient={quickTestRecipient}
            setQuickTestRecipient={setQuickTestRecipient}
            setActiveTab={setActiveTab}
          />

          <PasscodeModal 
            showPasscodeModal={showPasscodeModal}
            setShowPasscodeModal={setShowPasscodeModal}
            handleChangePasscode={handleChangePasscode}
            passcodeChangeError={passcodeChangeError}
            passcodeChangeSuccess={passcodeChangeSuccess}
            currentPasscodeForm={currentPasscodeForm}
            setCurrentPasscodeForm={setCurrentPasscodeForm}
            newPasscodeForm={newPasscodeForm}
            setNewPasscodeForm={setNewPasscodeForm}
            confirmPasscodeForm={confirmPasscodeForm}
            setConfirmPasscodeForm={setConfirmPasscodeForm}
            autoLockTimeout={autoLockTimeout}
            setAutoLockTimeout={setAutoLockTimeout}
          />

          {/* --- BOTTOM RESPONSIVE VIEWBAR FOR MOBILE --- */}
          <AppBottomNav 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* --- BANK-GRADE TOAST NOTIFICATION STACK --- */}
          <NotificationToastStack 
            bankingNotifications={bankingNotifications}
            setBankingNotifications={setBankingNotifications}
          />

          {/* --- AI COPILOT WIDGET --- */}
          <AiCopilotWidget 
            isAiOpen={isAiOpen}
            setIsAiOpen={setIsAiOpen}
            setActiveTab={setActiveTab}
            addLog={addLog}
            templates={templates}
            setTemplates={setTemplates}
          />

        </main>
      </div>
    </div>
  );
}
