import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, WifiOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Detect online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Detect if running as standalone PWA
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture install prompt for Android/Chrome/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Status Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[300] bg-slate-900/95 text-amber-300 border border-amber-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Mode Offline Aktif (PWA) - Data draf & template tetap tersedia</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating PWA Add to Home Screen Banner */}
      <AnimatePresence>
        {(showPrompt || (isIos && !isInstalled && showPrompt)) && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[250] bg-slate-900/95 text-slate-100 border border-amber-500/40 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/50 shrink-0 shadow-md">
                  <img 
                    src="/pwa-icon.png" 
                    alt="Logo J.A.R.V.I.S" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight flex items-center gap-1.5 truncate">
                    J.A.R.V.I.S Relay Console
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[8.5px] font-mono rounded border border-amber-500/30 shrink-0">PWA</span>
                  </h4>
                  <p className="text-[10px] text-slate-300 font-semibold truncate mt-0.5">
                    Pasang ke Layar Utama Ponsel
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                title="Sembunyikan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIos ? (
              <div className="p-2 bg-slate-800/80 rounded-xl text-[10.5px] text-slate-300 font-semibold space-y-1 border border-slate-700/60">
                <p className="flex items-center gap-1 text-amber-300 font-bold">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  Petunjuk PWA untuk Safari iOS:
                </p>
                <p className="leading-relaxed">
                  Ketuk ikon <strong>'Bagikan' (Share)</strong> di bagian bawah browser, lalu pilih <strong>'Tambah ke Layar Utama' (Add to Home Screen)</strong>.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pasang di Layar Utama
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
