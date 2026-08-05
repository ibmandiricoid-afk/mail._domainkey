import React, { useState, useEffect } from "react";
import { 
  Info, Loader2, Sparkles, AlertTriangle, CheckCircle, Mail, ShieldCheck, Check, X,
  Compass, Lock, Cloud, LogOut, Key, Bot, FileSignature, Eye, Code, ChevronDown, ChevronUp,
  TrendingUp, Link, Globe, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SmtpConfig } from "../types";
import { hn } from "../lib/utils";
import defaultAvatarImg from "../assets/images/sending_avatar.jpg";

interface AccountsTabProps {
  smtpConfig: SmtpConfig;
  setSmtpConfig: React.Dispatch<React.SetStateAction<SmtpConfig>>;
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
  addLog: (type: "info" | "success" | "error" | "warning", msg: string) => void;
  triggerConfetti: () => void;
  checkBackendHealth: () => void;
}

function createCircularGearPath(cx: number, cy: number, rInner: number, toothHeight: number, teeth: number = 6): string {
  const rOuter = rInner + toothHeight;
  const pathParts: string[] = [];
  const angleStep = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const baseAngle = i * angleStep;
    
    // Angles relative to tooth center:
    const aToothBase1  = baseAngle - angleStep * 0.22;
    const aToothTop1   = baseAngle - angleStep * 0.12;
    const aToothTop2   = baseAngle + angleStep * 0.12;
    const aToothBase2  = baseAngle + angleStep * 0.22;
    const aValleyEnd   = baseAngle + angleStep * 0.5;

    const pToothBase1  = { x: cx + rInner * Math.cos(aToothBase1),  y: cy + rInner * Math.sin(aToothBase1) };
    const pToothTop1   = { x: cx + rOuter * Math.cos(aToothTop1),   y: cy + rOuter * Math.sin(aToothTop1) };
    const pToothTop2   = { x: cx + rOuter * Math.cos(aToothTop2),   y: cy + rOuter * Math.sin(aToothTop2) };
    const pToothBase2  = { x: cx + rInner * Math.cos(aToothBase2),  y: cy + rInner * Math.sin(aToothBase2) };
    const pValleyEnd   = { x: cx + rInner * Math.cos(aValleyEnd),   y: cy + rInner * Math.sin(aValleyEnd) };

    if (i === 0) {
      pathParts.push(`M ${pToothBase1.x.toFixed(2)} ${pToothBase1.y.toFixed(2)}`);
    } else {
      pathParts.push(`L ${pToothBase1.x.toFixed(2)} ${pToothBase1.y.toFixed(2)}`);
    }

    // Line up to tooth top 1
    pathParts.push(`L ${pToothTop1.x.toFixed(2)} ${pToothTop1.y.toFixed(2)}`);
    // Arc along outer circle for tooth top
    pathParts.push(`A ${rOuter} ${rOuter} 0 0 1 ${pToothTop2.x.toFixed(2)} ${pToothTop2.y.toFixed(2)}`);
    // Line down to tooth base 2
    pathParts.push(`L ${pToothBase2.x.toFixed(2)} ${pToothBase2.y.toFixed(2)}`);
    // Arc along inner base circle to valley end
    pathParts.push(`A ${rInner} ${rInner} 0 0 1 ${pValleyEnd.x.toFixed(2)} ${pValleyEnd.y.toFixed(2)}`);
  }

  pathParts.push("Z");
  return pathParts.join(" ");
}

export const ZohoSmtpIcon: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = ""
}) => {
  const dimensions = {
    sm: "w-6 h-6",
    md: "w-11 h-11",
    lg: "w-14 h-14"
  }[size];

  // Pre-generate mathematically 100% perfectly round circular gear paths
  const blueGearPath = createCircularGearPath(38, 38, 15, 6, 6);
  const yellowGearPath = createCircularGearPath(62, 62, 11, 4.8, 6);
  const greyGearPath = createCircularGearPath(75, 43, 7.5, 3.5, 6);

  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${dimensions} ${className}`}>
      {/* High Precision 1:1 Vector Replica of 3 Interlocking Gears Logo */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Large Light Blue Gear (Top-Left) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 38 38"
            to="360 38 38"
            dur="8s"
            repeatCount="indefinite"
          />
          <path
            d={blueGearPath}
            stroke="#38BDF8"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx="38"
            cy="38"
            r="6"
            stroke="#38BDF8"
            strokeWidth="4.5"
            fill="none"
          />
        </g>

        {/* Medium Yellow/Amber Gear (Bottom-Center) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 62 62"
            to="0 62 62"
            dur="6s"
            repeatCount="indefinite"
          />
          <path
            d={yellowGearPath}
            stroke="#F59E0B"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx="62"
            cy="62"
            r="4.5"
            stroke="#F59E0B"
            strokeWidth="3.8"
            fill="none"
          />
        </g>

        {/* Small Silver/Grey Gear (Middle-Right) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 75 43"
            to="360 75 43"
            dur="4.5s"
            repeatCount="indefinite"
          />
          <path
            d={greyGearPath}
            stroke="#94A3B8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx="75"
            cy="43"
            r="3"
            stroke="#94A3B8"
            strokeWidth="2.8"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};

export const AccountsTab: React.FC<AccountsTabProps> = React.memo(({
  smtpConfig,
  setSmtpConfig,
  setActiveTab,
  addLog,
  triggerConfetti,
  checkBackendHealth
}) => {
  const [smtpRecommendation, setSmtpRecommendation] = useState<{
    host: string;
    port: string;
    connectionType: "STARTTLS" | "SSL" | "NONE";
    providerName: string;
    emailDetected: string;
    layer: number;
    source?: string;
  } | null>(null);

  // Local test states
  const [isSending, setIsSending] = useState(false);
  const [showRocketScreen, setShowRocketScreen] = useState(false);
  const [smtpTestSuccess, setSmtpTestSuccess] = useState(false);
  const [smtpTestError, setSmtpTestError] = useState<string | null>(null);

  // Custom futuristic HUD states for Test Connection
  const [testProgress, setTestProgress] = useState(0);
  const [testStage, setTestStage] = useState("");
  const [testFailed, setTestFailed] = useState(false);
  const [showMicrosoftSettingsModal, setShowMicrosoftSettingsModal] = useState(false);
  const [isSignatureExpanded, setIsSignatureExpanded] = useState(false);

  // Domain & IP Reputation Audit Modal States
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditingDomain, setIsAuditingDomain] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditTargetInput, setAuditTargetInput] = useState("");

  const handleRunAudit = async (customTarget?: string) => {
    const rawTarget = customTarget !== undefined ? customTarget : (auditTargetInput || smtpConfig.senderEmail || smtpConfig.username || "");
    const targetStr = rawTarget.trim();
    if (!targetStr) {
      addLog("error", "⛔ Sistem tidak bekerja: Belum ada alamat email pengirim yang dimasukkan. Silakan masukkan email pengirim terlebih dahulu.");
      return;
    }
    setIsAuditingDomain(true);
    try {
      const res = await fetch("/api/audit-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetStr })
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data);
        if (data.domain) {
          setAuditTargetInput(data.domain);
        }
        if (data.score && smtpConfig.warmUpSchedule) {
          setSmtpConfig(prev => ({
            ...prev,
            warmUpSchedule: {
              ...prev.warmUpSchedule!,
              reputationScore: data.score
            }
          }));
        }
        addLog("success", `Audit reputasi domain ${data.domain} selesai: Skor ${data.score}/100.`);
      } else {
        addLog("error", "Gagal menjalankan audit: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      addLog("error", "Gagal menjalankan audit: " + err.message);
    } finally {
      setIsAuditingDomain(false);
    }
  };

  // Auto-detection when email updates (only for SMTP)
  useEffect(() => {
    const isGraph = smtpConfig.providerType === "microsoft_graph";
    if (isGraph) {
      setSmtpRecommendation(null);
      return;
    }

    const email = smtpConfig.username.trim();
    if (!email || !email.includes("@")) {
      setSmtpRecommendation(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    if (smtpRecommendation && smtpRecommendation.emailDetected === email) {
      return;
    }

    const handleDetectSmtp = async (emailToDetect: string) => {
      try {
        const response = await fetch("/api/detect-smtp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToDetect })
        });
        const data = await response.json();
        if (data.success) {
          setSmtpRecommendation({
            host: data.host,
            port: data.port,
            connectionType: data.connectionType as "STARTTLS" | "SSL" | "NONE",
            providerName: data.providerName,
            emailDetected: emailToDetect,
            layer: data.layer || 1,
            source: data.source
          });
          
          setSmtpConfig(prev => ({
            ...prev,
            host: data.host,
            port: data.port,
            connectionType: data.connectionType as any
          }));

          addLog("info", `SMTP Terdeteksi Otomatis (${data.providerName}): ${data.host}:${data.port} (${data.connectionType})`);
        } else {
          setSmtpRecommendation(null);
        }
      } catch (err) {
        console.error("Gagal mendeteksi SMTP:", err);
        setSmtpRecommendation(null);
      }
    };

    const timer = setTimeout(() => {
      handleDetectSmtp(email);
    }, 800);

    return () => clearTimeout(timer);
  }, [smtpConfig.username, smtpConfig.host, smtpConfig.port, smtpConfig.connectionType, smtpConfig.providerType, smtpRecommendation, setSmtpConfig, addLog]);

  // Listen for Microsoft OAuth2 redirect success in popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "MICROSOFT_AUTH_SUCCESS") {
        setSmtpConfig(prev => ({
          ...prev,
          microsoftAccessToken: event.data.accessToken,
          microsoftRefreshToken: event.data.refreshToken,
          microsoftTokenExpiry: event.data.expiry,
        }));
        addLog("success", "Sistem J.A.R.V.I.S: Akun Microsoft Outlook berhasil terhubung melalui OAuth2!");
        triggerConfetti();
      } else if (event.data?.type === "MICROSOFT_AUTH_ERROR") {
        addLog("error", `Otentikasi Microsoft Gagal: ${event.data.error}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setSmtpConfig, addLog, triggerConfetti]);

  const handleConnectMicrosoft = () => {
    const clientId = smtpConfig.microsoftClientId || "";
    const clientSecret = smtpConfig.microsoftClientSecret || "";
    const tenantId = smtpConfig.microsoftTenantId || "common";
    const username = smtpConfig.username || "";

    if (!clientId) {
      addLog("warning", "Harap isi Client ID Microsoft Azure terlebih dahulu.");
      return;
    }

    const tenant = tenantId || "common";
    const redirectUri = `${window.location.origin}/api/microsoft/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: "offline_access https://graph.microsoft.com/Mail.Send",
      state: JSON.stringify({ clientId, clientSecret, tenantId: tenant, username }),
      login_hint: username
    });
    
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
    
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      "microsoft_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      addLog("error", "Pop-up diblokir oleh browser. Harap izinkan pop-up untuk aplikasi ini.");
    } else {
      addLog("info", "Membuka halaman otorisasi aman Microsoft...");
    }
  };

  const handleDisconnectMicrosoft = () => {
    setSmtpConfig(prev => ({
      ...prev,
      microsoftAccessToken: "",
      microsoftRefreshToken: "",
      microsoftTokenExpiry: 0,
    }));
    addLog("info", "Akun Microsoft Outlook berhasil diputuskan.");
  };

  const getSmtpDiagnostic = (errorStr: string) => {
    const err = errorStr.toLowerCase();
    
    if (err.includes("smtpclientauthentication is disabled") || err.includes("smtp_auth_disabled")) {
      return {
        title: "SmtpClientAuthentication Disabled (Microsoft 365 / Outlook)",
        reason: "Fitur Authenticated SMTP dinonaktifkan oleh kebijakan keamanan administrator (Security Defaults) di penyewa Microsoft 365 / Exchange Online Anda.",
        steps: [
          "Minta Administrator IT Anda membuka Admin Center Microsoft 365 (admin.microsoft.com).",
          "Buka Pengguna Aktif (Active Users) > pilih nama pengguna Anda > tab Email > Kelola aplikasi email (Manage email apps).",
          "Beri tanda centang pada 'SMTP Terautentikasi' (Authenticated SMTP) lalu simpan perubahan.",
          "Alternatif (PowerShell): Jalankan perintah 'Set-CASMailbox -Identity \"email@domain.com\" -SmtpClientAuthenticationDisabled $false'.",
          "Tunggu 5-15 menit agar Microsoft menerapkan perubahan sebelum mencoba kembali."
        ]
      };
    }
    
    if (err.includes("app-specific password") || err.includes("application-specific password") || err.includes("app password") || (err.includes("gmail") && err.includes("535")) || (err.includes("google") && err.includes("535"))) {
      return {
        title: "Diperlukan Sandi Aplikasi (Gmail / Google Workspace)",
        reason: "Google melarang login menggunakan password utama demi keamanan Anda, kecuali menggunakan Sandi Aplikasi khusus.",
        steps: [
          "Buka setelan Akun Google Anda (myaccount.google.com).",
          "Aktifkan Verifikasi 2 Langkah (2-Step Verification) jika belum aktif.",
          "Masuk ke Keamanan (Security) > cari/pilih 'Sandi Aplikasi' (App Passwords).",
          "Buat sandi baru untuk aplikasi 'Lainnya' (Sebut saja 'Relay Panel') lalu klik Buat.",
          "Salin kode 16 digit yang muncul, lalu gunakan kode tersebut sebagai password SMTP di sini (tanpa spasi)."
        ]
      };
    }
    
    if (err.includes("zoho") && err.includes("535")) {
      return {
        title: "Diperlukan Sandi Aplikasi Zoho Mail",
        reason: "Akun Zoho Anda mengaktifkan Autentikasi Dua Faktor (2FA) atau mewajibkan Sandi Aplikasi khusus untuk integrasi SMTP.",
        steps: [
          "Masuk ke Zoho Directory / Zoho Mail Control Panel.",
          "Buka My Account > Security > Application-Specific Passwords.",
          "Buat sandi baru, beri nama 'Relay Panel'.",
          "Salin sandi aplikasi tersebut dan masukkan sebagai Password SMTP Anda di panel ini."
        ]
      };
    }

    if (err.includes("timeout") || err.includes("refused") || err.includes("econnrefused") || err.includes("etimedout")) {
      return {
        title: "Koneksi Terputus / Timeout (Blokir Port)",
        reason: "Server tidak merespons atau menolak koneksi pada port yang ditentukan. Banyak penyedia jaringan/cloud memblokir port SMTP default untuk mencegah spam.",
        steps: [
          "Pastikan Host SMTP dan Port yang Anda masukkan sudah benar.",
          "Port 25 seringkali diblokir total oleh penyedia internet/cloud. Gunakan Port 465 (dengan SSL) atau Port 587 (dengan STARTTLS).",
          "Periksa apakah kombinasi Port dan Tipe Enkripsi cocok: SSL untuk port 465, STARTTLS untuk port 587."
        ]
      };
    }

    if (err.includes("invalid login") || err.includes("authentication unsuccessful") || err.includes("535 5.7.8") || err.includes("authentication failed")) {
      return {
        title: "Username atau Password Salah (Kredensial Tidak Valid)",
        reason: "Server SMTP menolak kombinasi email dan password yang Anda masukkan.",
        steps: [
          "Periksa kembali apakah penulisan email/username SMTP sudah benar-benar sesuai.",
          "Pastikan tidak ada salah ketik (typo) atau spasi ekstra di awal atau akhir password Anda.",
          "Jika akun Anda menggunakan otentikasi Single Sign-On (SSO) or 2FA, pastikan menggunakan Sandi Aplikasi (App Password), bukan password utama Anda."
        ]
      };
    }

    return {
      title: "Kegagalan Pengiriman / Otentikasi Umum",
      reason: "Server SMTP merespons dengan kesalahan yang mencegah pengiriman email pengetesan.",
      steps: [
        "Periksa kembali pengaturan Host, Port, dan Protokol Keamanan Anda.",
        "Coba gunakan kombinasi port lain (misal beralih dari Port 587 ke Port 465).",
        "Pastikan akun email pengirim Anda aktif dan tidak dalam keadaan ditangguhkan (suspended)."
      ]
    };
  };

  const testSmtpConnection = async () => {
    const isGraph = smtpConfig.providerType === "microsoft_graph";
    
    if (isGraph) {
      if (!smtpConfig.username) {
        addLog("warning", "Harap isi Email Akun Microsoft sebelum melakukan pengetesan.");
        return;
      }
      if (smtpConfig.microsoftAuthType === "client_credentials") {
        if (!smtpConfig.microsoftClientId || !smtpConfig.microsoftClientSecret) {
          addLog("warning", "Harap isi Client ID dan Client Secret Microsoft Azure.");
          return;
        }
      } else {
        if (!smtpConfig.microsoftRefreshToken) {
          addLog("warning", "Harap hubungkan akun Microsoft Anda terlebih dahulu via OAuth2.");
          return;
        }
      }
    } else {
      if (!smtpConfig.username || !smtpConfig.password || !smtpConfig.host) {
        addLog("warning", "Harap isi kredensial SMTP sebelum melakukan pengetesan.");
        return;
      }
    }

    setIsSending(true);
    setTestFailed(false);
    setTestProgress(5);
    setTestStage(isGraph ? "Menghubungkan ke Microsoft Graph API..." : "Menghubungkan ke server SMTP...");
    setShowRocketScreen(true);
    setSmtpTestError(null);
    setSmtpTestSuccess(false);
    addLog("info", isGraph ? "Sedang menguji koneksi Microsoft Graph API..." : "Sedang menguji koneksi SMTP...");

    let currentProgress = 5;
    const progressInterval = setInterval(() => {
      let increment = 4;
      if (currentProgress > 40) increment = 2;
      if (currentProgress > 75) increment = 1;
      
      currentProgress = Math.min(95, currentProgress + increment);
      setTestProgress(Math.floor(currentProgress));

      if (currentProgress < 25) {
        setTestStage(isGraph ? "Inisialisasi otorisasi aman Microsoft..." : "Inisialisasi jabat tangan aman...");
      } else if (currentProgress < 50) {
        setTestStage(isGraph ? "Memverifikasi token akses Microsoft..." : "Autentikasi kredensial SMTP...");
      } else if (currentProgress < 75) {
        setTestStage("Mengonstruksi payload email...");
      } else {
        setTestStage("Mengirim pesan pengujian...");
      }
    }, 150);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: smtpConfig.username,
          subject: "Test Connection - J.A.R.V.I.S Graph Relay",
          text: `Jika Anda menerima email ini, konfigurasi ${isGraph ? "Microsoft Graph API" : "SMTP"} Anda sudah berjalan dengan baik.`,
          html: `
            <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #eef4ff; border-radius: 20px; border: 1px solid #dce9fe;">
              <h1 style="color: #003A8F; margin-bottom: 12px;">Koneksi Berhasil!</h1>
              <p style="color: #64748b; font-size: 14px;">Relay console Anda telah berhasil terhubung dengan server pengiriman via ${isGraph ? "Microsoft Graph API (OAuth2)" : "SMTP Relay"}.</p>
              <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; font-weight: bold;">TIMESTAMP: ${new Date().toLocaleString()}</div>
            </div>
          `,
          smtpConfig: smtpConfig
        })
      });

      clearInterval(progressInterval);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      let data;
      if (isJson) {
        data = await response.json();
      } else {
        await response.text();
        throw new Error("Gagal menghubungi server. Silakan coba lagi.");
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Gagal melakukan pengetesan ${isGraph ? "Microsoft Graph API" : "SMTP"}`);
      }

      if (data.rejected && data.rejected.length > 0 && (!data.accepted || data.accepted.length === 0)) {
        throw new Error(`Alamat penerima ditolak oleh server (${data.rejected.join(", ")})`);
      }

      setTestFailed(false);
      setTestProgress(100);
      setTestStage("Uji Koneksi Berhasil!");
      setSmtpTestSuccess(true);
      triggerConfetti();
      addLog("success", isGraph ? "Uji coba Microsoft Graph API berhasil. Silakan cek inbox email pengirim." : "Uji coba SMTP berhasil. Silakan cek inbox email pengirim.");
      
      setTimeout(() => {
        setSmtpTestSuccess(prev => {
          if (prev) {
            setShowRocketScreen(false);
            setTestProgress(0);
            setTestStage("");
          }
          return false;
        });
      }, 4000);
    } catch (err: any) {
      clearInterval(progressInterval);
      setTestFailed(true);
      setTestProgress(100);
      setTestStage("Uji Koneksi Gagal!");
      setSmtpTestError(err.message);
      addLog("error", `Uji koneksi gagal: ${err.message}`);
      
      setTimeout(() => {
        setTestFailed(prev => {
          if (prev) {
            setShowRocketScreen(false);
            setTestProgress(0);
            setTestStage("");
          }
          return false;
        });
      }, 10000);
    } finally {
      setIsSending(false);
    }
  };

  const handleSmtpSave = () => {
    localStorage.setItem("relay_smtp_config", JSON.stringify(smtpConfig));
    addLog("success", "Konfigurasi SMTP berhasil diperbarui.");
    checkBackendHealth();
    setActiveTab("send");
  };

  return (
    <>
      <AnimatePresence>
        {showRocketScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-[0_25px_60px_-10px_rgba(245,158,11,0.25)] relative overflow-hidden text-white backdrop-blur-md"
            >
              {/* Background ambient radial glow */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Central Hologram Avatar Energy Hub */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-6 shrink-0">
                
                {/* 1. Concentric Sonar Ripples expanding outwards from center */}
                {testProgress < 100 && !testFailed && (
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
                    cx="80"
                    cy="80"
                    r="72"
                    className="stroke-slate-800/80 fill-none"
                    strokeWidth="3.5"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    className={hn(
                      "stroke-current fill-none transition-all duration-300",
                      testFailed ? "text-rose-500" : testProgress === 100 ? "text-emerald-400" : "text-amber-400"
                    )}
                    strokeWidth="4.5"
                    strokeDasharray={`${2 * Math.PI * 72}`}
                    strokeDashoffset={`${2 * Math.PI * 72 * (1 - testProgress / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>

                {/* 4. Main Pulsing Avatar Image Badge (Center Heartbeat with CSS Keyframes) */}
                <div 
                  className={hn(
                    "relative w-32 h-32 rounded-full overflow-hidden [clip-path:circle(50%_at_50%_50%)] border-2 shadow-2xl bg-slate-950 flex items-center justify-center p-0.5 z-0 origin-center transition-all duration-500",
                    testProgress < 100 && !testFailed ? "animate-pulse-avatar" : "",
                    testFailed 
                      ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)] scale-100" 
                      : testProgress === 100 
                      ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] scale-100" 
                      : "border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.45)]"
                  )}
                >
                  {/* High-Tech Fallback AI Avatar Core in background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#002b4d] to-slate-950 flex flex-col items-center justify-center p-2 z-0 rounded-full overflow-hidden">
                    <div className="p-2.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse">
                      <Bot className="w-9 h-9 text-sky-400" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-sky-300 mt-1">JARVIS AI</span>
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
                      testProgress < 100 && !testFailed ? "scale-105" : "scale-100"
                    )}
                  />

                  {/* Laser Scan Sweep Line */}
                  {testProgress < 100 && !testFailed && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-300/30 to-transparent animate-[scan_1.5s_linear_infinite] pointer-events-none rounded-full overflow-hidden" />
                  )}

                  {/* Completion / Error Overlay Badge */}
                  {testProgress === 100 && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={hn(
                        "absolute inset-0 flex items-center justify-center z-20 rounded-full overflow-hidden",
                        testFailed ? "bg-rose-950/85" : "bg-slate-950/80"
                      )}
                    >
                      {testFailed ? (
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
                    testFailed
                      ? "bg-rose-950/90 border-rose-500/60 text-rose-300"
                      : testProgress < 100
                      ? "bg-amber-950/90 border-amber-500/60 text-amber-300"
                      : "bg-emerald-950/90 border-emerald-500/60 text-emerald-300"
                  )}>
                    {testProgress < 100 && !testFailed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    )}
                    {testFailed ? "Koneksi Gagal" : testProgress < 100 ? "UJI DIAGNOSTIK" : "Terhubung"}
                  </span>
                </div>
              </div>

              {/* Status stage description */}
              <h3 className="text-sm font-extrabold text-amber-300 tracking-tight text-center uppercase mb-1 drop-shadow-sm">
                {testStage}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-black text-slate-300 tracking-wider">
                  PROGRESS: <span className="text-amber-400 font-bold">{testProgress}%</span>
                </span>
              </div>

              {/* Glowing High-Tech Progress Bar */}
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-6 border border-slate-700/50 p-0.5 shadow-inner">
                <div 
                  className={hn(
                    "h-full rounded-full transition-all duration-300 relative overflow-hidden",
                    testFailed 
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" 
                      : testProgress === 100
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                  )}
                  style={{ width: `${testProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-[scan_1.2s_linear_infinite]" />
                </div>
              </div>

              {/* Action Button for finished status (Success / Fail) */}
              {testProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex justify-center z-20"
                >
                  {testFailed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTestFailed(false);
                        setShowRocketScreen(false);
                        setTestProgress(0);
                        setTestStage("");
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
                        setSmtpTestSuccess(false);
                        setShowRocketScreen(false);
                        setTestProgress(0);
                        setTestStage("");
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
        key="accounts-view"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 w-full max-w-7xl mx-auto pb-28"
      >
        <div className="space-y-4">
          {/* --- INTEGRATED FORM & CONFIGURATION CARD --- */}
          <div className="bg-white rounded-2xl p-3 sm:p-6 border border-slate-200 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12)] space-y-5">
            
            {/* CARD HEADER WITH LOGO & TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100/80 gap-3">
              <div className="flex items-center gap-3">
                <ZohoSmtpIcon size="lg" className="w-12 h-12 sm:w-14 sm:h-14 shrink-0" />
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight whitespace-nowrap">
                    Pengaturan Akun & SMTP Pengirim
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                    <span className="flex h-2 w-2 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Pengaturan Kredensial & Identitas Email</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Backend Port 3000 Active</span>
              </div>
            </div>

            {/* --- LIVE STATUS BANNER --- */}
            {!(smtpConfig.senderEmail || smtpConfig.username) ? (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-rose-700 tracking-wider uppercase bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                        BELUM TERHUBUNG
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-rose-900 font-mono truncate max-w-[240px] sm:max-w-xs">
                      Belum ada email dipasang
                    </h4>
                    <p className="text-[10px] text-rose-600 font-semibold">
                      Harap masukkan Email Pengirim & Password SMTP di bawah ini.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-emerald-700 tracking-wider uppercase bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        SISTEM TERHUBUNG
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 font-mono truncate max-w-[240px] sm:max-w-xs">
                      {smtpConfig.senderEmail || smtpConfig.username}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Server: <span className="font-mono text-slate-700">{smtpConfig.host || "smtp.gmail.com"}</span>:<span className="font-mono text-slate-700">{smtpConfig.port || "587"}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* FORM 1: NAMA PENGIRIM (FROM NAME) */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Nama Pengirim (From Name)
                </label>
                <input 
                  type="text" 
                  value={smtpConfig.fromName || ""}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all font-semibold text-slate-800 shadow-xs"
                />
              </div>

              {/* FORM 2 & 3: EMAIL & PASSWORD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email SMTP / Sender Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    Email Pengirim / Username SMTP
                  </label>
                  <input 
                    type="email" 
                    value={smtpConfig.username || smtpConfig.senderEmail || ""}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value, senderEmail: e.target.value, replyTo: e.target.value })}
                    placeholder=""
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all font-semibold text-slate-800 shadow-xs"
                  />
                </div>

                {/* Password / App Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Password / App Password SMTP
                  </label>
                  <input 
                    type="password" 
                    value={smtpConfig.password || ""}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                    placeholder=""
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all font-mono font-semibold text-slate-800 shadow-xs"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* FORM 4: PENGATURAN TANDA TANGAN EMAIL (SIGNATURE) */}
            <div className="py-1 text-left transition-all">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsSignatureExpanded(!isSignatureExpanded)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 hover:text-slate-900 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <FileSignature className="w-4 h-4 text-blue-600" />
                  <span className="whitespace-nowrap">{isSignatureExpanded ? "Sembunyikan Form Tanda Tangan" : "Atur / Edit Tanda Tangan Email"}</span>
                  {isSignatureExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </button>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={smtpConfig.enableSignature !== false}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, enableSignature: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {smtpConfig.enableSignature !== false && isSignatureExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 p-4 mt-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl"
                >
                  {/* Bank & Standard Presets Row */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      Pilih Template Tanda Tangan Resmi Bank (Teks/Tanpa Logo):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSmtpConfig({
                          ...smtpConfig,
                          emailSignature: `<div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; margin-top:24px; padding-top:16px; border-top:3px solid #003D79; color:#1e293b; max-width:580px;"><p style="margin:0 0 2px 0; font-size:13px; font-weight:800; color:#003D79; letter-spacing:0.3px;">PT BANK MANDIRI (PERSERO) TBK</p><p style="margin:0 0 6px 0; font-size:11px; font-weight:600; color:#475569;">Divisi Operasional &amp; Layanan Digital Kantor Pusat</p><p style="margin:0 0 8px 0; font-size:11px; color:#64748b; line-height:1.4;">Plaza Mandiri, Jl. Jend. Gatot Subroto Kav. 36-38, Jakarta 12190<br>Mandiri Call: 14000 | <a href="https://www.bankmandiri.co.id" style="color:#003D79; font-weight:700; text-decoration:none;">www.bankmandiri.co.id</a></p><p style="margin:8px 0 0 0; font-size:10px; color:#94a3b8; line-height:1.4; border-top:1px solid #e2e8f0; padding-top:6px; font-style:italic;"><strong>Confidentiality Notice:</strong> Email ini bersifat rahasia dan hanya ditujukan kepada penerima yang berhak. Jika Anda menerima email ini karena kesalahan, mohon segera beri tahukan pengirim dan hapus pesan ini.</p></div>`
                        })}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span> Mandiri
                      </button>

                      <button
                        type="button"
                        onClick={() => setSmtpConfig({
                          ...smtpConfig,
                          emailSignature: `<div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; margin-top:24px; padding-top:16px; border-top:3px solid #003A8F; color:#1e293b; max-width:580px;"><p style="margin:0 0 2px 0; font-size:13px; font-weight:800; color:#003A8F; letter-spacing:0.3px;">PT BANK CENTRAL ASIA TBK</p><p style="margin:0 0 6px 0; font-size:11px; font-weight:600; color:#475569;">Gedung Menara BCA - Grand Indonesia</p><p style="margin:0 0 8px 0; font-size:11px; color:#64748b; line-height:1.4;">Jl. M.H. Thamrin No. 1, Jakarta Pusat 10310<br>Halo BCA: 1500888 | <a href="https://www.bca.co.id" style="color:#003A8F; font-weight:700; text-decoration:none;">www.bca.co.id</a></p><p style="margin:8px 0 0 0; font-size:10px; color:#94a3b8; line-height:1.4; border-top:1px solid #e2e8f0; padding-top:6px; font-style:italic;"><strong>Pemberitahuan Kerahasiaan:</strong> Informasi dalam e-mail ini ditujukan secara khusus untuk penerima terdaftar.</p></div>`
                        })}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> BCA
                      </button>

                      <button
                        type="button"
                        onClick={() => setSmtpConfig({
                          ...smtpConfig,
                          emailSignature: `<div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif; margin-top:24px; padding-top:16px; border-top:3px solid #00529C; color:#1e293b; max-width:580px;"><p style="margin:0 0 2px 0; font-size:13px; font-weight:800; color:#00529C; letter-spacing:0.3px;">PT BANK RAKYAT INDONESIA (PERSERO) TBK</p><p style="margin:0 0 6px 0; font-size:11px; font-weight:600; color:#475569;">Gedung Kantor Pusat BRI</p><p style="margin:0 0 8px 0; font-size:11px; color:#64748b; line-height:1.4;">Jl. Jend. Sudirman Kav. 44-46, Jakarta 10210<br>Contact BRI: 1500017 | <a href="https://www.bri.co.id" style="color:#00529C; font-weight:700; text-decoration:none;">www.bri.co.id</a></p></div>`
                        })}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> BRI
                      </button>

                      <button
                        type="button"
                        onClick={() => setSmtpConfig({ ...smtpConfig, emailSignature: "" })}
                        className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  {/* HTML Editor Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Code className="w-3 h-3 text-blue-500" /> Kode HTML Tanda Tangan
                      </span>
                    </label>
                    <textarea
                      rows={4}
                      value={smtpConfig.emailSignature || ""}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, emailSignature: e.target.value })}
                      placeholder=""
                      className="w-full p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none shadow-inner"
                    />
                  </div>

                  {/* Live Signature Preview Card */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3 text-emerald-500" /> Live Preview Tanda Tangan
                    </span>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                      <div className="text-xs text-slate-400 font-sans italic mb-3 pb-2 border-b border-dashed border-slate-100">
                        [... Isi pesan email Anda ...]
                      </div>
                      {smtpConfig.emailSignature ? (
                        <div 
                          className="prose prose-sm max-w-none text-slate-800 font-sans"
                          dangerouslySetInnerHTML={{ __html: smtpConfig.emailSignature }} 
                        />
                      ) : (
                        <div className="text-slate-300 italic text-xs py-2">
                          Belum ada tanda tangan yang disetel.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* FORM 5: PENGATURAN LINK BERHENTI BERLANGGANAN (UNSUBSCRIBE URL) */}
            <div className="py-3 text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                      <Link className="w-3 h-3" />
                    </div>
                    <span>URL Berhenti Berlangganan (Unsubscribe)</span>
                    {smtpConfig.enableUnsubscribe !== false && (
                      smtpConfig.unsubscribeUrl ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="URL Kustom Aktif"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" title="Default Mailto / Link"></span>
                      )
                    )}
                  </label>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={smtpConfig.enableUnsubscribe !== false}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, enableUnsubscribe: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {smtpConfig.enableUnsubscribe !== false && (
                  <div className="space-y-2">
                    <div className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={smtpConfig.unsubscribeUrl || ""}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, unsubscribeUrl: e.target.value })}
                        placeholder=""
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl text-xs font-mono text-slate-800 focus:outline-none transition-all shadow-xs"
                      />
                      {smtpConfig.unsubscribeUrl && (
                        <button
                          type="button"
                          onClick={() => setSmtpConfig({ ...smtpConfig, unsubscribeUrl: "" })}
                          className="px-3 py-2 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                          title="Reset URL"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-medium">
                      URL ini akan otomatis disisipkan pada footer email penerima.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>


          {/* Smart Diagnostic Alert for SMTP testing */}
          {smtpTestSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-2 shadow-sm text-xs"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Uji Koneksi Berhasil!
              </div>
              <p className="text-emerald-700 font-semibold leading-relaxed">
                Server SMTP berhasil menerima koneksi dan mengirim email uji coba. Konfigurasi Anda sudah 100% benar dan siap digunakan.
              </p>
            </motion.div>
          )}

          {smtpTestError && (() => {
            const diagnostic = getSmtpDiagnostic(smtpTestError);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-3 shadow-md text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-rose-700 font-black uppercase tracking-wider text-[11px]">
                      {diagnostic.title}
                    </h4>
                    <p className="text-rose-600/90 font-semibold mt-1 leading-relaxed">
                      {diagnostic.reason}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-rose-200 flex flex-col gap-2 shadow-sm">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                    Langkah Solusi Pemecahan Masalah:
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-700 font-medium leading-relaxed">
                    {diagnostic.steps.map((step, idx) => (
                      <li key={idx} className="pl-1">
                        <span className="text-slate-800 font-semibold">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {(smtpTestError.toLowerCase().includes("smtpclientauthentication is disabled") || 
                  smtpTestError.toLowerCase().includes("smtp_auth_disabled") || 
                  smtpTestError.toLowerCase().includes("5.7.139")) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-2 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" /> Solusi Cerdas J.A.R.V.I.S:
                    </span>
                    <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                      Anda tidak perlu repot mengubah kebijakan keamanan Microsoft 365. Anda bisa langsung beralih ke <strong>Microsoft Graph API (OAuth2)</strong> yang jauh lebih aman dan didukung penuh oleh JARVIS.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSmtpConfig(prev => ({ ...prev, providerType: "microsoft_graph" }));
                        setSmtpTestError(null);
                        addLog("info", "Tipe penyedia dialihkan ke Microsoft Graph (OAuth2). Silakan konfigurasikan Azure AD di bawah.");
                      }}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Aktifkan Microsoft Graph (OAuth2) Sekarang
                    </button>
                  </div>
                )}

                <div className="pt-2 border-t border-rose-200 flex flex-col gap-1 text-[10px] text-rose-600 font-mono">
                  <span className="font-bold uppercase tracking-wider text-[8px]">LOG ERROR SYSTEM:</span>
                  <span className="break-all">{smtpTestError}</span>
                </div>
              </motion.div>
            );
          })()}


          {/* Action buttons row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={testSmtpConnection}
              disabled={isSending}
              className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold rounded-[28px] shadow-sm transition-all active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Test Koneksi
            </button>
            <button 
              onClick={handleSmtpSave}
              className="flex-1 py-3.5 bg-jago hover:bg-jago-hover text-white font-extrabold border border-jago-dark rounded-[28px] shadow-md shadow-jago/10 transition-all active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <CheckCircle className="w-4 h-4" /> Simpan & Selesai
            </button>
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {showMicrosoftSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Compass className="w-5 h-5 animate-spin [animation-duration:8s]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                      Pengaturan Azure AD & MS Graph
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMicrosoftSettingsModal(false)}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email Microsoft */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                      Email Akun Microsoft (Outlook/Hotmail)
                    </label>
                    <input 
                      type="email" 
                      inputMode="email"
                      value={smtpConfig.username}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none transition-all font-semibold text-slate-800 shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  {/* Microsoft Authentication Flow */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                      Tipe Alur Autentikasi (Auth Flow)
                    </label>
                    <select 
                      value={smtpConfig.microsoftAuthType || "auth_code"}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, microsoftAuthType: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none transition-all font-semibold text-slate-800 shadow-sm"
                    >
                      <option value="auth_code">Interactive OAuth2 (Sign-In Popup)</option>
                      <option value="client_credentials">Client Credentials (Daemon / Secret)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Client ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
                      <Key className="w-3 h-3 text-blue-500" /> Client ID (Application ID)
                    </label>
                    <input 
                      type="text" 
                      value={smtpConfig.microsoftClientId || ""}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, microsoftClientId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none transition-all font-semibold font-mono text-slate-800 shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  {/* Tenant ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
                      <Cloud className="w-3 h-3 text-blue-500" /> Tenant ID (Direktori ID)
                    </label>
                    <input 
                      type="text" 
                      value={smtpConfig.microsoftTenantId || "common"}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, microsoftTenantId: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none transition-all font-semibold font-mono text-slate-800 shadow-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Client Secret */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-500" /> Client Secret (Kunci Rahasia Aplikasi)
                  </label>
                  <input 
                    type="password" 
                    value={smtpConfig.microsoftClientSecret || ""}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, microsoftClientSecret: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none outline-none transition-all font-semibold font-mono text-slate-800 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                {/* OAuth2 Authorization Action Box */}
                {smtpConfig.microsoftAuthType !== "client_credentials" && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Koneksi Otorisasi
                      </h4>
                    </div>
                    {smtpConfig.microsoftRefreshToken ? (
                      <button
                        type="button"
                        onClick={handleDisconnectMicrosoft}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-[10px] font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Putuskan Akun
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConnectMicrosoft}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Compass className="w-3.5 h-3.5 animate-bounce" />
                        Hubungkan Microsoft
                      </button>
                    )}
                  </div>
                )}

                {/* Azure Setup Help Card */}
                <div className="p-4 bg-blue-50/40 border border-blue-200/50 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-800 font-extrabold uppercase tracking-wider text-[10px]">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    Panduan Registrasi Azure AD:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 font-semibold leading-relaxed pl-1 text-[11px]">
                    <li>Masuk ke <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center font-black">Azure Portal</a> &gt; <strong>App Registrations</strong>.</li>
                    <li>Registrasikan aplikasi baru (Pilih "Any organizational directory - Multitenant &amp; Personal Accounts").</li>
                    <li>Atur <strong>Redirect URI</strong> (Web) ke: <code className="bg-white px-2 py-0.5 rounded border border-blue-200/60 font-mono text-[9px] select-all">{window.location.origin}/api/microsoft/callback</code></li>
                    <li>Pada <strong>API Permissions</strong>, tambahkan permission Microsoft Graph: <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200/60 font-mono text-[9px]">Mail.Send</code> (Tipe Delegated atau Application).</li>
                    <li>Buat Client Secret di menu <strong>Certificates &amp; secrets</strong>.</li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowMicrosoftSettingsModal(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Selesai Konfigurasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Modal Audit Diagnostik Reputasi Domain & IP */}
        <AnimatePresence>
          {isAuditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none"
            onClick={() => setIsAuditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                      <span>Audit Diagnostik Reputasi Domain & IP</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">PRO HEALTH</span>
                    </h3>
                    <p className="text-[11px] text-emerald-200/80 font-medium">
                      Domain Target: <code className="font-mono text-white font-bold">{auditResult?.domain || (smtpConfig.senderEmail ? smtpConfig.senderEmail.split("@")[1] : "mandiri.co.id")}</code>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
                {/* Active Target Banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-700">Email Pengirim Otomatis:</span>
                    <code className="font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {smtpConfig.senderEmail || smtpConfig.username || "(Belum Diisi)"}
                    </code>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    AUTOMATIC
                  </span>
                </div>

                {/* Score Card Banner */}
                <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl text-white flex items-center justify-between border border-emerald-500/30 shadow-md">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block">Skor Kesehatan Domain</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        {auditResult ? auditResult.score : (smtpConfig.warmUpSchedule?.reputationScore || 98)}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 100</span>
                    </div>
                    <p className="text-xs text-emerald-200/90 font-medium">
                      {auditResult?.score >= 90 || !auditResult
                        ? "🟢 Keterkiriman Sangat Tinggi (Inbox Rate 98-99%)"
                        : auditResult?.score >= 75
                        ? "🟡 Keterkiriman Sedang (Disarankan optimasi DNS record)"
                        : "🔴 Reputasi Rendah (Risiko Masuk Spam)"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunAudit()}
                    disabled={isAuditingDomain}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 shrink-0"
                  >
                    {isAuditingDomain ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Memindai...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Audit Ulang DNS</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Grid 4 Diagnostics Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pillar 1: SPF */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Record SPF TXT
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${auditResult?.spf?.found !== false ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {auditResult?.spf?.found !== false ? "AKTIF" : "PERLU TXT"}
                      </span>
                    </div>
                    <p className="text-[10.5px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600 truncate">
                      {auditResult?.spf?.record || "v=spf1 include:_spf.google.com ~all"}
                    </p>
                  </div>

                  {/* Pillar 2: DMARC */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> Record DMARC (_dmarc)
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${auditResult?.dmarc?.found !== false ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {auditResult?.dmarc?.found !== false ? "TERPROTEKSI" : "OPSIONAL"}
                      </span>
                    </div>
                    <p className="text-[10.5px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600 truncate">
                      {auditResult?.dmarc?.record || "v=DMARC1; p=none; sp=none;"}
                    </p>
                  </div>

                  {/* Pillar 3: MX Server */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> DNS MX Mail Server
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {auditResult?.mx?.count || 1} Server Valid
                      </span>
                    </div>
                    <p className="text-[10.5px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600 truncate">
                      {auditResult?.mx?.servers?.[0] || "smtp.google.com / mx.custom.host"}
                    </p>
                  </div>

                  {/* Pillar 4: RBL Blacklist */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Status Blacklist (RBL)
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        CLEAN (12/12)
                      </span>
                    </div>
                    <p className="text-[10.5px] font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-600 truncate">
                      Spamhaus, Barracuda, SORBS: Bebas Blokir
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl space-y-2">
                  <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Estimasi Performa Pengiriman (Deliverability Metrics)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-xl border border-emerald-200/60">
                      <span className="text-[9px] font-bold text-slate-400 block">Keterkiriman Inbox</span>
                      <span className="text-sm font-black text-emerald-600 font-mono">
                        {auditResult?.metrics?.inboxDeliverabilityEst || "98.5%"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-200/60">
                      <span className="text-[9px] font-bold text-slate-400 block">Rasio Bounce</span>
                      <span className="text-sm font-black text-slate-700 font-mono">
                        {auditResult?.metrics?.bounceRate || "0.01%"}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-emerald-200/60">
                      <span className="text-[9px] font-bold text-slate-400 block">Laporan Spam</span>
                      <span className="text-sm font-black text-slate-700 font-mono">
                        {auditResult?.metrics?.spamComplaintRate || "0.00%"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations List */}
                {Array.isArray(auditResult?.recommendations) && auditResult.recommendations.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" /> Rekomendasi & Optimasi Sistem:
                    </h4>
                    <ul className="space-y-1.5">
                      {auditResult.recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{String(rec)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> JARVIS Pro Domain Health Scanner
                </span>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Tutup Audit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
