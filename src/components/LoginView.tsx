import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock } from "lucide-react";
import { triggerVibration } from "../lib/utils";
import coolYellowAnonymous from "../assets/images/cool_yellow_anonymous_1786018183746.jpg";
import splashImage from "../assets/images/user_provided_splash.jpg";

interface LoginViewProps {
  passcode: string;
  setPasscode: React.Dispatch<React.SetStateAction<string>>;
  passcodeError: boolean;
  setPasscodeError: React.Dispatch<React.SetStateAction<boolean>>;
  jarvisBg: string;
}

// Ultra-smooth easing curve
const smoothEase = [0.16, 1, 0.3, 1];

// Staggered variants for keypad buttons
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

export const LoginView: React.FC<LoginViewProps> = ({
  passcode,
  setPasscode,
  passcodeError,
  setPasscodeError,
  jarvisBg,
}) => {
  const [showKeypad, setShowKeypad] = useState(false);
  const [bgSrc, setBgSrc] = useState(coolYellowAnonymous || splashImage || jarvisBg);

  // Auto-reveal floating PIN keypad after image splash effect duration (1.8s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowKeypad(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // Listen to physical keyboard for PIN login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        setShowKeypad(true);
        setPasscodeError(false);
        setPasscode((prev) => {
          if (prev.length < 6) return prev + e.key;
          return prev;
        });
      } else if (e.key === "Backspace") {
        setShowKeypad(true);
        setPasscodeError(false);
        setPasscode((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape" || e.key === "Delete") {
        setShowKeypad(true);
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
      <div 
        onClick={() => !showKeypad && setShowKeypad(true)}
        className="w-full min-h-screen min-h-[100dvh] max-w-lg mx-auto bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden cursor-pointer"
      >
        {/* --- FULL SCREEN BACKGROUND IMAGE WITH CLEAR VISIBILITY & SMOOTH FADE --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.img
            src={bgSrc}
            alt="Splash Screen"
            referrerPolicy="no-referrer"
            onError={() => {
              if (bgSrc !== jarvisBg) {
                setBgSrc(jarvisBg);
              }
            }}
            initial={{ scale: 1.08, filter: "brightness(1.0)" }}
            animate={{ 
              scale: showKeypad ? 1.02 : 1.0,
              filter: showKeypad ? "brightness(0.82) contrast(1.05)" : "brightness(1.0)" 
            }}
            transition={{ duration: 1.2, ease: smoothEase }}
            className="w-full h-full object-cover object-center"
          />

          {/* Smooth Subtle Vignette Overlay */}
          <motion.div 
            animate={{ opacity: showKeypad ? 0.35 : 0.15 }}
            transition={{ duration: 1.2, ease: smoothEase }}
            className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40" 
          />
        </div>

        {/* Top Spacer */}
        <div className="relative z-10 w-full pt-4" />

        {/* --- ULTRA SMOOTH FLOATING PIN KEYPAD --- */}
        <AnimatePresence mode="wait">
          {showKeypad && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: smoothEase }}
              className="w-full max-w-xs flex flex-col items-center relative z-20 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Text & Icon */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: smoothEase }}
                className="mb-4 flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900/60 border border-slate-500/40 backdrop-blur-md flex items-center justify-center shadow-xl">
                  <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xs sm:text-sm font-mono font-bold text-slate-100 tracking-[0.25em] uppercase drop-shadow-md">
                  MASUKKAN PIN
                </h2>
              </motion.div>

              {/* PIN Dots Display */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: passcodeError ? [0, -8, 8, -8, 8, 0] : 0 
                }}
                transition={{ 
                  duration: passcodeError ? 0.4 : 0.6, 
                  delay: passcodeError ? 0 : 0.2, 
                  ease: smoothEase 
                }}
                className="flex justify-center gap-4 py-2 mb-2 w-full"
              >
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const isFilled = passcode.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-300 ${
                        passcodeError
                          ? "border-rose-400 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                          : isFilled 
                            ? "border-emerald-400 bg-emerald-400 scale-110 shadow-[0_0_14px_rgba(52,211,153,0.9)]" 
                            : "border-slate-300/40 bg-slate-950/40 backdrop-blur-md"
                      }`}
                    />
                  );
                })}
              </motion.div>

              {/* Error Message */}
              <div className="h-6 flex items-center justify-center mb-3">
                <AnimatePresence mode="wait">
                  {passcodeError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -4, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="text-[11px] font-bold text-rose-300 text-center uppercase tracking-wider bg-rose-950/80 px-3.5 py-1 rounded-full border border-rose-500/50 shadow-lg backdrop-blur-md"
                    >
                      PIN Salah! Silakan coba lagi
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* STAGGERED FLOATING NUMERIC BUTTONS */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center w-full max-w-[260px] mx-auto"
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <motion.button
                    key={num}
                    variants={itemVariants}
                    whileTap={{ scale: 0.88 }}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-slate-950/45 hover:bg-slate-900/75 active:bg-slate-800/90 text-white font-medium text-2xl flex items-center justify-center transition-colors cursor-pointer shadow-xl border border-slate-500/35 select-none outline-none backdrop-blur-md"
                  >
                    {num}
                  </motion.button>
                ))}
                
                {/* Row 4: Empty space, "0", Backspace */}
                <div className="w-16 h-16" />
                <motion.button
                  variants={itemVariants}
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-slate-950/45 hover:bg-slate-900/75 active:bg-slate-800/90 text-white font-medium text-2xl flex items-center justify-center transition-colors cursor-pointer shadow-xl border border-slate-500/35 select-none outline-none backdrop-blur-md"
                >
                  0
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-slate-950/30 hover:bg-slate-900/60 active:bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg border border-slate-600/25 select-none outline-none backdrop-blur-md"
                  aria-label="Backspace"
                >
                  <svg width="24" height="18" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18L2 10L9 2H25C26.1 2 27 2.9 27 4V16C27 17.1 26.1 18 25 18H9Z" />
                    <path d="M14 7L20 13M20 7L14 13" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Bottom Footer */}
        <div className="relative z-10 w-full text-center pb-2">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider opacity-80">
            © GF-V104 Secure System
          </p>
        </div>
      </div>
    </div>
  );
};
