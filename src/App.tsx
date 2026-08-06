import React, { useState, useEffect, useCallback } from "react";
import { 
  KeyRound, 
  LogOut, 
  ChevronLeft, 
  Sparkles, 
} from "lucide-react";
import { SendTab } from "./components/SendTab";
import { TemplatesTab } from "./components/TemplatesTab";
import { TerminalTab } from "./components/TerminalTab";
import { AccountsTab, ZohoSmtpIcon } from "./components/AccountsTab";
import { AppBottomNav } from "./components/AppBottomNav";
import { NotificationToastStack } from "./components/NotificationToastStack";
import { AiCopilotWidget } from "./components/AiCopilotWidget";
import { LoginView } from "./components/LoginView";
import { TemplateFormModal } from "./components/modals/TemplateFormModal";
import { TemplatePreviewModal } from "./components/modals/TemplatePreviewModal";
import { DeleteConfirmModal } from "./components/modals/DeleteConfirmModal";
import { QuickTestModal } from "./components/modals/QuickTestModal";
import { PasscodeModal } from "./components/modals/PasscodeModal";
import { hn } from "./lib/utils";
import { motion } from "motion/react";

// Types
import { 
  SmtpConfig, 
  EmailTemplate, 
  LogEntry, 
  BankingNotification, 
  EmailValidationRecord 
} from "./types";

export type TabType = "send" | "templates" | "terminal" | "accounts";

export interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "circle" | "square" | "triangle";
  rotate: number;
  rotateSpeed: number;
  delay: number;
  duration: number;
}

// Background asset
import jarvisBg from "./assets/images/jarvis_cool_background_1783882128944.jpg";

// Initial Defaults
const DEFAULT_SMTP: SmtpConfig = {
  host: "",
  port: "",
  username: "",
  password: "",
  senderEmail: "",
  fromName: "",
  replyTo: "",
  dailyLimit: "",
  connectionType: "SSL",
  logoUrl: "",
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [];

export default function App() {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    localStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_logged_in");
    return false;
  });
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  
  // Custom Saved Passcode state (Default: "030819")
  const [storedPasscode, setStoredPasscode] = useState(() => {
    const saved = localStorage.getItem("jarvis_access_pin");
    if (!saved || saved === "123456") {
      localStorage.setItem("jarvis_access_pin", "030819");
      return "030819";
    }
    return saved;
  });

  // Passcode Change Modal state
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [currentPasscodeForm, setCurrentPasscodeForm] = useState("");
  const [newPasscodeForm, setNewPasscodeForm] = useState("");
  const [confirmPasscodeForm, setConfirmPasscodeForm] = useState("");
  const [passcodeChangeError, setPasscodeChangeError] = useState<string | null>(null);
  const [passcodeChangeSuccess, setPasscodeChangeSuccess] = useState<string | null>(null);

  // Auto lock timeout state in minutes (default 15 minutes, 0 = disabled)
  const [autoLockTimeout, setAutoLockTimeout] = useState<number>(() => {
    const saved = localStorage.getItem("jarvis_autolock_minutes");
    return saved !== null ? parseInt(saved, 10) : 15;
  });

  // --- Active Workspace Tab ---
  const [activeTab, setActiveTab] = useState<TabType>("send");

  // --- SMTP Backend Health Status ---
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // --- Core Application State ---
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    const saved = localStorage.getItem("jarvis_smtp_config");
    if (!saved) return DEFAULT_SMTP;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.username === "admin@mandiri.co.id") {
        return DEFAULT_SMTP;
      }
      return parsed;
    } catch {
      return DEFAULT_SMTP;
    }
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem("jarvis_email_templates");
    if (!saved) return [];
    try {
      const parsed: EmailTemplate[] = JSON.parse(saved);
      return parsed.filter((t) => t.id !== "tpl_1" && t.id !== "tpl_2");
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("jarvis_system_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Real-time Validation History State ---
  const [validationRecords, setValidationRecords] = useState<EmailValidationRecord[]>(() => {
    const saved = localStorage.getItem("jarvis_validation_records");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Bank-grade Toast Notification System ---
  const [bankingNotifications, setBankingNotifications] = useState<BankingNotification[]>([]);

  // --- Confetti Animation Particles ---
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Modals State ---
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "General",
    subject: "",
    message: "",
  });

  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  const [quickTestTemplate, setQuickTestTemplate] = useState<EmailTemplate | null>(null);
  const [quickTestRecipient, setQuickTestRecipient] = useState("");

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  // --- Logger Helper ---
  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      type,
      message,
    };
    setLogs((prev) => [newEntry, ...prev]);
  }, []);

  // Check Backend SMTP Health
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch("/api/smtp/health", { method: "GET" });
      if (response.ok) {
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      checkBackendHealth();
      const interval = setInterval(checkBackendHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, checkBackendHealth]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("jarvis_smtp_config", JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  useEffect(() => {
    localStorage.setItem("jarvis_email_templates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("jarvis_system_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("jarvis_validation_records", JSON.stringify(validationRecords));
  }, [validationRecords]);

  // Handle Passcode Validation
  useEffect(() => {
    if (passcode.length === 6) {
      if (passcode === storedPasscode) {
        setIsLoggedIn(true);
        sessionStorage.setItem("admin_logged_in", "true");
        setPasscodeError(false);
        setPasscode("");
        addLog("success", "Akses berhasil! Pengguna masuk ke sistem JARVIS.");
      } else {
        setPasscodeError(true);
        addLog("error", "Gagal masuk: PIN Akses salah.");
        setTimeout(() => {
          setPasscode("");
        }, 500);
      }
    }
  }, [passcode, storedPasscode, addLog]);

  // Auto Lock Inactivity Timer
  useEffect(() => {
    if (!isLoggedIn || autoLockTimeout <= 0) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLoggedIn(false);
        sessionStorage.removeItem("admin_logged_in");
        addLog("warning", `Sistem terkunci otomatis karena inaktivitas (${autoLockTimeout} menit).`);
      }, autoLockTimeout * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn, autoLockTimeout, addLog]);

  // Handle Changing Passcode
  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeChangeError(null);
    setPasscodeChangeSuccess(null);

    if (currentPasscodeForm !== storedPasscode) {
      setPasscodeChangeError("PIN Lama salah.");
      return;
    }

    if (newPasscodeForm.length !== 6 || !/^\d+$/.test(newPasscodeForm)) {
      setPasscodeChangeError("PIN Baru harus 6 digit angka.");
      return;
    }

    if (newPasscodeForm !== confirmPasscodeForm) {
      setPasscodeChangeError("Konfirmasi PIN Baru tidak cocok.");
      return;
    }

    setStoredPasscode(newPasscodeForm);
    localStorage.setItem("jarvis_access_pin", newPasscodeForm);
    setPasscodeChangeSuccess("PIN Akses berhasil diperbarui!");
    setCurrentPasscodeForm("");
    setNewPasscodeForm("");
    setConfirmPasscodeForm("");
    addLog("info", "PIN Akses administrator diperbarui.");

    setTimeout(() => {
      setShowPasscodeModal(false);
      setPasscodeChangeSuccess(null);
    }, 1500);
  };

  // Trigger Celebration Confetti
  const triggerConfetti = useCallback(() => {
    const colors = ["#00a8ff", "#00d2d3", "#ff9f43", "#10ac84", "#5f27cd", "#ff6b6b", "#e1b12c"];
    const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];

    const newParticles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: 50,
      y: 50,
      vx: (Math.random() - 0.5) * 28,
      vy: (Math.random() - 0.8) * 24,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotate: Math.random() * 360,
      rotateSpeed: (Math.random() - 0.5) * 25,
      delay: Math.random() * 0.1,
      duration: Math.random() * 1.5 + 1.8,
    }));

    setConfettiParticles(newParticles);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3500);
  }, []);

  // Template Handlers
  const handleTemplateMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplateForm({ ...templateForm, message: e.target.value });
  };

  const handleSuggestCategory = () => {
    setIsSuggestingCategory(true);
    setTimeout(() => {
      const text = (templateForm.subject + " " + templateForm.message).toLowerCase();
      let suggested = "General";

      if (text.includes("OTP") || text.includes("verifikasi") || text.includes("pin") || text.includes("kode")) {
        suggested = "OTP / Security";
      } else if (text.includes("tagihan") || text.includes("pembayaran") || text.includes("saldo") || text.includes("transaksi")) {
        suggested = "Billing & Finance";
      } else if (text.includes("sandi") || text.includes("reset") || text.includes("password")) {
        suggested = "Account Recovery";
      } else if (text.includes("promo") || text.includes("diskon") || text.includes("cashback")) {
        suggested = "Marketing";
      }

      setTemplateForm((prev) => ({ ...prev, category: suggested }));
      setIsSuggestingCategory(false);
      addLog("info", `AI menyarankan kategori "${suggested}" untuk template.`);
    }, 600);
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.message.trim()) {
      return;
    }

    if (editingTemplateId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplateId
            ? {
                ...t,
                name: templateForm.name,
                category: templateForm.category as any,
                subject: templateForm.subject,
                message: templateForm.message,
              }
            : t
        )
      );
      addLog("info", `Template "${templateForm.name}" diperbarui.`);
    } else {
      const newTemp: EmailTemplate = {
        id: "tpl_" + Date.now().toString(),
        name: templateForm.name,
        category: templateForm.category as any,
        subject: templateForm.subject,
        message: templateForm.message,
        createdAt: Date.now(),
      };
      setTemplates((prev) => [newTemp, ...prev]);
      addLog("success", `Template baru "${templateForm.name}" ditambahkan.`);
    }

    setShowTemplateModal(false);
    setEditingTemplateId(null);
    setTemplateForm({ name: "", category: "General", subject: "", message: "" });
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    addLog("warning", `Template ID "${id}" telah dihapus.`);
    setTemplateToDelete(null);
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setPasscode("");
    localStorage.removeItem("admin_logged_in");
    sessionStorage.removeItem("admin_logged_in");
    addLog("warning", "Admin keluar dari sistem.");
  }, [addLog]);

  // --- RENDER APP WITH LOGIN & SMARTPHONE SHELL LAYOUT ---
  return (
    <>
      {!isLoggedIn ? (
        <LoginView 
          passcode={passcode}
          setPasscode={setPasscode}
          passcodeError={passcodeError}
          setPasscodeError={setPasscodeError}
          jarvisBg={jarvisBg}
        />
      ) : (
        <div className="min-h-screen min-h-[100dvh] bg-slate-950 flex items-center justify-center font-sans text-slate-800 overflow-hidden relative select-none">
          {/* Mobile Shell Frame */}
          <div className="w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] mx-auto bg-[#e8edf5] rounded-none sm:rounded-[40px] border-0 sm:border-[8px] border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden hardware-accelerated shrink-0">
            
            {/* Dynamic Island Notch (Desktop Preview Only) */}
            <div className="hidden sm:flex items-center justify-center h-5 bg-[#003b6d] shrink-0 z-40 relative">
              <div className="w-20 h-3 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="w-1 h-1 rounded-full bg-sky-900" />
              </div>
            </div>

            {/* --- SYSTEM BACKGROUND --- */}
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

            {/* --- HEADER --- */}
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
              
              {/* Centered Logo & Brand Text "JARVIS" */}
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

            {/* --- MAIN WORKSPACE VIEW CONTROLLER --- */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ display: activeTab === "send" ? "flex" : "none" }}>
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
                />
              </div>
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ display: activeTab === "terminal" ? "flex" : "none" }}>
                <TerminalTab 
                  logs={logs}
                  setLogs={setLogs}
                  addLog={addLog}
                  smtpConfig={smtpConfig}
                  setSmtpConfig={setSmtpConfig}
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
            </main>

            {/* --- BOTTOM RESPONSIVE VIEWBAR FOR MOBILE --- */}
            <AppBottomNav 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

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

          </div>
        </div>
      )}
    </>
  );
}
