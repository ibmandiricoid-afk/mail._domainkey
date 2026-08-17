import React from "react";
import { motion } from "motion/react";
import { Check, X, Bot } from "lucide-react";
import { hn } from "../lib/utils";
import defaultAvatarImg from "../assets/images/sending_avatar.jpg";

interface SecurityRadarScannerProps {
  progress: number;
  stage: string;
  isCompleted: boolean;
  hasFailed: boolean;
  avatarUrl?: string;
  statusPillText?: string;
  onClose?: () => void;
  closeButtonText?: string;
  size?: "md" | "lg";
}

export const SecurityRadarScanner: React.FC<SecurityRadarScannerProps> = ({
  progress,
  stage,
  isCompleted,
  hasFailed,
  avatarUrl,
  statusPillText,
  onClose,
  closeButtonText = "TUTUP DIAGNOSTIK",
  size = "lg",
}) => {
  const isLg = size === "lg";
  const hubSizeClass = isLg ? "w-64 h-64 sm:w-72 sm:h-72" : "w-56 h-56 sm:w-64 sm:h-64";
  const avatarSizeClass = isLg ? "w-28 h-28 sm:w-32 sm:h-32" : "w-24 h-24 sm:w-28 sm:h-28";
  const radius = isLg ? 112 : 96;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(100, Math.max(0, progress)) / 100);

  const displayAvatar = avatarUrl || defaultAvatarImg;

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center relative text-white select-none">
      {/* Pure Concentric Circular Radar - Video Style */}
      <div className={hn("relative flex items-center justify-center shrink-0 my-2", hubSizeClass)}>
        
        {/* 1. Subtle Circular Soft Light (Pure Radial Circle) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: hasFailed
              ? "radial-gradient(circle at center, rgba(244,63,94,0.2) 0%, rgba(244,63,94,0.05) 55%, transparent 70%)"
              : isCompleted
              ? "radial-gradient(circle at center, rgba(56,189,248,0.28) 0%, rgba(37,99,235,0.08) 55%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(56,189,248,0.22) 0%, rgba(14,165,233,0.06) 55%, transparent 70%)"
          }}
        />

        {/* 2. Concentric Sonar Pulses */}
        {!isCompleted && !hasFailed && (
          <>
            <motion.div
              className="absolute inset-2 rounded-full border border-sky-400/30 pointer-events-none"
              animate={{ scale: [0.85, 1.25], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-cyan-300/20 pointer-events-none"
              animate={{ scale: [0.85, 1.45], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: "easeOut" }}
            />
          </>
        )}

        {/* 3. Static Concentric Radar Guide Rings */}
        <div className="absolute inset-2 rounded-full border border-sky-300/20 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-sky-300/25 pointer-events-none" />
        <div className="absolute inset-16 rounded-full border border-sky-300/30 pointer-events-none" />
        <div className="absolute inset-24 rounded-full border border-sky-400/35 pointer-events-none" />

        {/* 4. Orbiting Dot Nodes along the rings */}
        <motion.div
          className="absolute inset-2 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        >
          <div className="absolute top-[22%] right-3 w-2 h-2 rounded-full bg-sky-300 shadow-[0_0_8px_#38bdf8]" />
          <div className="absolute bottom-[28%] left-4 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        </motion.div>

        <motion.div
          className="absolute inset-8 rounded-full pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        >
          <div className="absolute top-2 left-[30%] w-1.5 h-1.5 rounded-full bg-blue-300 shadow-[0_0_6px_#93c5fd]" />
          <div className="absolute bottom-3 right-[25%] w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_8px_#bae6fd]" />
        </motion.div>

        {/* 5. Smooth Rotating Radar Sweep Fan (Exact match from video) */}
        {!isCompleted && !hasFailed && (
          <motion.div
            className="absolute inset-2 rounded-full pointer-events-none overflow-hidden"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: "conic-gradient(from 0deg at 50% 50%, rgba(56, 189, 248, 0.45) 0deg, rgba(34, 211, 238, 0.18) 45deg, rgba(56, 189, 248, 0) 90deg, rgba(56, 189, 248, 0) 360deg)",
              }}
            />
            {/* Subtle high-tech radial grid line on the sweep */}
            <div 
              className="absolute inset-0 opacity-25 rounded-full"
              style={{
                backgroundImage: "radial-gradient(circle at center, transparent 35%, rgba(56, 189, 248, 0.5) 36%, transparent 37%), linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 16px 16px, 16px 16px"
              }}
            />
          </motion.div>
        )}

        {/* 6. Subtle Circular Progress Arc around the outer edge */}
        <svg 
          viewBox="0 0 256 256"
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
        >
          <circle
            cx="128"
            cy="128"
            r={radius}
            className="stroke-sky-950/50 fill-none"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            className={hn(
              "stroke-current fill-none transition-all duration-300",
              hasFailed 
                ? "text-rose-500" 
                : isCompleted 
                ? "text-sky-300" 
                : "text-cyan-400"
            )}
            strokeWidth={strokeWidth + 1}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* 7. Center Pulsing User Uploaded Avatar / Hologram Image */}
        <motion.div
          animate={
            hasFailed
              ? { scale: 1, rotate: [0, -3, 3, 0] }
              : isCompleted
              ? { scale: [1, 1.04, 1], filter: "drop-shadow(0 0 20px rgba(56, 189, 248, 0.8))" }
              : { scale: [1, 1.03, 1] }
          }
          transition={{
            repeat: Infinity,
            duration: isCompleted ? 2.5 : 2,
            ease: "easeInOut",
          }}
          className={hn(
            "relative z-20 rounded-full overflow-hidden [clip-path:circle(50%_at_50%_50%)] border-2 shadow-2xl bg-slate-950 flex items-center justify-center p-0.5 select-none transition-all duration-500",
            avatarSizeClass,
            hasFailed
              ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
              : isCompleted
              ? "border-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.7)]"
              : "border-cyan-400/90 shadow-[0_0_25px_rgba(34,211,238,0.55)]"
          )}
        >
          {/* AI fallback background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#002b4d] to-slate-950 flex flex-col items-center justify-center p-2 z-0 rounded-full overflow-hidden">
            <div className="p-2.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.4)] animate-pulse">
              <Bot className="w-8 h-8 text-sky-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-sky-300 mt-1">JARVIS</span>
          </div>

          {/* User's Custom Uploaded Photo */}
          <img
            src={displayAvatar}
            alt="Avatar Visual"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== defaultAvatarImg) {
                target.src = defaultAvatarImg;
              }
            }}
            className="relative z-10 w-full h-full object-cover rounded-full select-none origin-center"
          />

          {/* Scanning Laser Line Overlay */}
          {!isCompleted && !hasFailed && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-300/35 to-transparent animate-[scan_1.4s_linear_infinite] pointer-events-none rounded-full overflow-hidden z-15" />
          )}

          {/* Completed Checkmark / Failed Error Overlay */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={hn(
                "absolute inset-0 flex items-center justify-center z-25 rounded-full overflow-hidden backdrop-blur-xs",
                hasFailed ? "bg-rose-950/80" : "bg-slate-950/70"
              )}
            >
              {hasFailed ? (
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                  <X className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-sky-500/20 border-2 border-sky-300 flex items-center justify-center text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.8)]">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* 8. Status Badge Pill Below Center Avatar */}
        <div className="absolute -bottom-2 z-30">
          <span
            className={hn(
              "text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border shadow-xl flex items-center gap-1.5 transition-all duration-300",
              hasFailed
                ? "bg-rose-950/90 border-rose-500/60 text-rose-200"
                : isCompleted
                ? "bg-sky-950/90 border-sky-400/60 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                : "bg-slate-950/90 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            )}
          >
            {!isCompleted && !hasFailed && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
            {statusPillText || (hasFailed ? "GAGAL" : isCompleted ? "TERHUBUNG" : "JARVIS RELAY")}
          </span>
        </div>
      </div>

      {/* Stage Description Headline */}
      <h3 className="text-sm font-extrabold text-cyan-300 tracking-tight text-center uppercase mt-3 mb-1 drop-shadow-sm px-2">
        {stage}
      </h3>

      {/* Percentage Readout */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono font-black text-slate-300 tracking-wider">
          PERSENTASE: <span className="text-cyan-400 font-bold">{progress}%</span>
        </span>
      </div>

      {/* High-Tech Glowing Progress Bar */}
      <div className="w-64 sm:w-72 bg-slate-900/90 h-2 rounded-full overflow-hidden mb-5 border border-slate-700/60 p-0.5 shadow-inner">
        <div
          className={hn(
            "h-full rounded-full transition-all duration-300 relative overflow-hidden",
            hasFailed
              ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
              : isCompleted
              ? "bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
              : "bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-[scan_1.2s_linear_infinite]" />
        </div>
      </div>

      {/* Action Button for Finished Status (Success / Fail) */}
      {isCompleted && onClose && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-64 sm:w-72 mt-1"
        >
          <button
            type="button"
            onClick={onClose}
            className={hn(
              "w-full py-3 px-5 rounded-xl font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer",
              hasFailed
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-950/60"
            )}
          >
            {closeButtonText}
          </button>
        </motion.div>
      )}
    </div>
  );
};

