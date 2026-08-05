import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { triggerVibration } from "../lib/utils";

interface LoginViewProps {
  passcode: string;
  setPasscode: React.Dispatch<React.SetStateAction<string>>;
  passcodeError: boolean;
  setPasscodeError: React.Dispatch<React.SetStateAction<boolean>>;
  jarvisBg: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  passcode,
  setPasscode,
  passcodeError,
  setPasscodeError,
  jarvisBg,
}) => {
  // Listen to physical keyboard for PIN login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        setPasscodeError(false);
        setPasscode((prev) => {
          if (prev.length < 6) return prev + e.key;
          return prev;
        });
      } else if (e.key === "Backspace") {
        setPasscodeError(false);
        setPasscode((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape" || e.key === "Delete") {
        setPasscodeError(false);
        setPasscode("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPasscode, setPasscodeError]);

  const handleKeypadPress = (key: string) => {
    triggerVibration(10);
    setPasscodeError(false);
    setPasscode((prev) => {
      if (prev.length < 6) return prev + key;
      return prev;
    });
  };

  const handleKeypadBackspace = () => {
    triggerVibration(12);
    setPasscodeError(false);
    setPasscode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 flex items-center justify-center font-sans text-white overflow-hidden relative select-none">
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] mx-auto bg-gradient-to-b from-[#003b6d] via-[#005291] to-[#00274c] rounded-none sm:rounded-[40px] border-0 sm:border-[8px] border-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-2.5 sm:p-4 relative overflow-hidden">
        {/* Subtle Smartphone Camera Dynamic Island Notch (Desktop Preview Only) */}
        <div className="hidden sm:flex items-center justify-center absolute top-2 left-1/2 -translate-x-1/2 z-40">
          <div className="w-20 h-3 bg-slate-900/90 rounded-full flex items-center justify-center gap-1.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="w-1 h-1 rounded-full bg-sky-900" />
          </div>
        </div>

        {/* Hardware accelerated background subtle grid & jarvis overlay */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-cover bg-center bg-no-repeat opacity-[0.08]"
          style={{ backgroundImage: `url(${jarvisBg})` }}
        />
        <div 
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)"
          }}
        />

        {/* Version watermark in top-right */}
        <div className="absolute top-6 right-6 text-right select-none pointer-events-none z-10">
          <span className="text-[11px] font-medium text-white/70 tracking-tight font-mono">
            JARVIS v8.90
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-[95%] sm:max-w-sm flex flex-col items-center relative z-10 px-2 sm:px-4 py-6"
        >
          {/* Brand header badge */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white/20 border border-white/30 text-white rounded-2xl flex items-center justify-center shadow-md relative hardware-accelerated">
              <div className="flex items-center justify-center animate-[spin_10s_linear_infinite] will-change-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#005291]" />
            </div>
            <div className="text-center">
              <span className="font-mono font-black text-white tracking-[0.22em] text-base uppercase">
                JARVIS
              </span>
              <span className="block text-[8px] font-black tracking-[0.3em] text-white/80 uppercase mt-0.5">
                SECURE AUTHENTICATION
              </span>
            </div>
          </div>

          {/* Main Title */}
          <div className="w-full text-center flex flex-col items-center gap-1.5 mb-5">
            <h1 className="text-[17px] font-bold text-white tracking-wide drop-shadow-sm">
              Masukkan PIN kamu
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auto-Lock: Aktif (Diperlukan PIN saat membuka ulang)</span>
            </div>
          </div>

          {/* PIN Dots display */}
          <motion.div 
            animate={passcodeError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-4.5 py-2 my-2 w-full"
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = passcode.length > index;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-200 ${
                    passcodeError
                      ? "border-rose-400 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                      : isFilled 
                        ? "border-white bg-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.9)]" 
                        : "border-white/40 bg-white/15"
                  }`}
                />
              );
            })}
          </motion.div>

          <div className="h-6 flex items-center justify-center mb-3">
            <AnimatePresence mode="wait">
              {passcodeError && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[10px] font-extrabold text-rose-100 text-center uppercase tracking-wider bg-rose-600/90 px-3.5 py-1 rounded-full border border-rose-300/30 shadow-md backdrop-blur-sm"
                >
                  PIN Salah! Silakan coba lagi
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-5 sm:gap-y-5 sm:gap-x-6 justify-items-center w-full max-w-[260px] sm:max-w-[280px] mx-auto mb-6 sm:mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.92, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/18 hover:bg-white/28 active:bg-white/40 text-white font-medium text-2xl sm:text-3xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-sky-950/20 border border-white/25 select-none outline-none backdrop-blur-md"
              >
                {num}
              </motion.button>
            ))}
            
            {/* Row 4: Column 1 empty, Column 2 "0", Column 3 Backspace */}
            <div className="w-16 h-16 sm:w-20 sm:h-20" />
            <motion.button
              whileTap={{ scale: 0.92, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/18 hover:bg-white/28 active:bg-white/40 text-white font-medium text-2xl sm:text-3xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-sky-950/20 border border-white/25 select-none outline-none backdrop-blur-md"
            >
              0
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleKeypadBackspace}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer select-none outline-none"
              aria-label="Backspace"
            >
              <svg width="28" height="20" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18L2 10L9 2H25C26.1 2 27 2.9 27 4V16C27 17.1 26.1 18 25 18H9Z" />
                <path d="M14 7L20 13M20 7L14 13" />
              </svg>
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
};
