import React from "react";
import { motion } from "motion/react";
import { Send, Terminal as TerminalIcon, FileText } from "lucide-react";
import { hn, triggerVibration } from "../lib/utils";

interface AppBottomNavProps {
  activeTab: "send" | "templates" | "terminal" | "accounts";
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="shrink-0 relative w-full bg-gradient-to-r from-[#003b6d] via-[#005291] to-[#006bb3] border-t border-sky-400/20 h-[64px] flex items-center justify-around z-40 shadow-[0_-8px_30px_rgba(0,35,75,0.35)] px-4 overflow-visible backdrop-blur-md">
      {[
        { id: "templates", icon: FileText, label: "TEMPLATES" },
        { id: "send", icon: Send, label: "KIRIM" },
        { id: "terminal", icon: TerminalIcon, label: "LOGS" }
      ].map((item) => {
        const isTabActive = activeTab === item.id;
        const isSend = item.id === "send";

        return (
          <button
            key={item.id}
            onClick={() => {
              triggerVibration(12);
              if (isSend && activeTab === "send") {
                const formEl = document.getElementById("send-email-form") as HTMLFormElement | null;
                if (formEl) {
                  formEl.requestSubmit();
                }
              } else {
                setActiveTab(item.id as any);
              }
            }}
            className={hn(
              "relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group",
              isSend ? "w-16 h-full -translate-y-1.5 z-30" : "w-14 h-full z-10"
            )}
          >
            {isSend ? (
              <motion.div 
                animate={{ scale: isTabActive ? 1.1 : 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="relative flex items-center justify-center transform-gpu"
              >
                {/* Clean Ambient Glow */}
                <div className={hn(
                  "absolute -inset-1 rounded-full transition-opacity duration-300 pointer-events-none",
                  isTabActive 
                    ? "bg-sky-400/50 opacity-100 shadow-[0_0_20px_rgba(56,189,248,0.8)]" 
                    : "bg-sky-400/20 opacity-40 group-hover:opacity-75"
                )} />

                {/* Outer Gradient Ring */}
                <div className={hn(
                  "relative w-14 h-14 rounded-full p-[2.5px] transition-transform duration-300 shadow-[0_8px_20px_rgba(0,40,90,0.4)] transform-gpu",
                  isTabActive 
                    ? "bg-gradient-to-tr from-white via-sky-200 to-cyan-300 scale-105 shadow-[0_10px_25px_rgba(0,175,255,0.65)] ring-2 ring-white/40" 
                    : "bg-gradient-to-tr from-white via-sky-100/90 to-white/40 group-hover:scale-105"
                )}>
                  {/* Inner 3D Gradient Base */}
                  <div className={hn(
                    "w-full h-full rounded-full flex items-center justify-center relative overflow-hidden transition-colors duration-300",
                    isTabActive 
                      ? "bg-gradient-to-b from-[#005291] via-[#003b6d] to-[#00284d]" 
                      : "bg-gradient-to-b from-[#006bb3] via-[#004e8c] to-[#00335e]"
                  )}>
                    {/* Top Specular Lens Highlight */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none" />

                    {/* Paper Airplane Send Icon */}
                    <motion.div
                      animate={{ scale: isTabActive ? 1.15 : 1, rotate: isTabActive ? -4 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <item.icon className={hn(
                        "w-6 h-6 text-white transition-transform duration-200",
                        isTabActive ? "translate-x-0.5 -translate-y-0.5" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      )} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  animate={{ scale: isTabActive ? 1.12 : 1, y: isTabActive ? -1 : 0 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={hn(
                    "transition-all duration-300 relative z-10 flex items-center justify-center p-1.5 rounded-xl border",
                    isTabActive 
                      ? "bg-white text-[#005291] border-white shadow-md shadow-sky-900/30" 
                      : "text-white/80 hover:text-white border-transparent hover:bg-white/10"
                  )}
                >
                  <motion.div
                    animate={{ scale: isTabActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 22 }}
                  >
                    <item.icon className="w-4 h-4" />
                  </motion.div>
                </motion.div>
                {!isSend && (
                  <motion.span 
                    animate={{ scale: isTabActive ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={hn(
                      "font-black transition-all uppercase tracking-tight relative z-10 mt-0.5 text-[9px] whitespace-nowrap",
                      isTabActive ? "text-white font-extrabold" : "text-white/75"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isTabActive && !isSend && (
                  <motion.div 
                    layoutId="activeTabMobile" 
                    className="absolute bottom-0 w-12 h-1 bg-white rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.7)]"
                    transition={{ type: "spring", stiffness: 380, damping: 25 }}
                  />
                )}
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
};
