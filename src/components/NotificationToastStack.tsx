import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Globe, X } from "lucide-react";
import { BankingNotification } from "../types";

interface NotificationToastStackProps {
  bankingNotifications: BankingNotification[];
  setBankingNotifications: React.Dispatch<React.SetStateAction<BankingNotification[]>>;
}

export const NotificationToastStack: React.FC<NotificationToastStackProps> = ({
  bankingNotifications,
  setBankingNotifications,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[9999] flex flex-col gap-3 w-[95%] sm:w-full max-w-sm pointer-events-none px-2 sm:px-0">
      <AnimatePresence>
        {bankingNotifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }}
            className="bg-[#0c1f3d]/95 backdrop-blur-md border-l-4 border-l-sky-500 border border-white/10 rounded-xl p-3.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] flex gap-2.5 text-white pointer-events-auto overflow-hidden relative"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] font-mono">
                  {notif.title}
                </span>
                <span className="text-[8px] text-slate-500 font-bold ml-auto font-mono">
                  {notif.timestamp}
                </span>
              </div>

              <p className="text-xs font-bold leading-snug text-white/95">
                {notif.message}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-[9px] text-slate-400 font-bold font-mono">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-500/70" />
                  <span className="text-slate-300 font-extrabold max-w-[120px] truncate">{notif.recipient}</span>
                </div>
                {notif.ip && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-300">IP: {notif.ip}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setBankingNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              className="p-1 hover:bg-white/10 rounded-full shrink-0 h-fit self-start text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
