import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send } from "lucide-react";
import { EmailTemplate } from "../../types";

interface QuickTestModalProps {
  quickTestTemplate: EmailTemplate | null;
  setQuickTestTemplate: (template: EmailTemplate | null) => void;
  quickTestRecipient: string;
  setQuickTestRecipient: (val: string) => void;
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
}

export const QuickTestModal: React.FC<QuickTestModalProps> = ({
  quickTestTemplate,
  setQuickTestTemplate,
  quickTestRecipient,
  setQuickTestRecipient,
  setActiveTab,
}) => {

  return (
    <AnimatePresence>
      {quickTestTemplate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200 shadow-2xl p-5 text-slate-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                Kirim Email Percobaan
              </h3>
              <button 
                onClick={() => setQuickTestTemplate(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-slate-600 mb-4 bg-slate-50 p-2 rounded-lg border border-slate-200 font-medium">
              Mengirim: <span className="font-black text-slate-800">{quickTestTemplate.name}</span>
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-slate-500 uppercase mb-1 ml-1">
                  Alamat Penerima Tes
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    placeholder=""
                    value={quickTestRecipient}
                    onChange={(e) => setQuickTestRecipient(e.target.value)}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData("text");
                      if (pastedText) {
                        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                        const matches = pastedText.match(emailRegex);
                        if (matches && matches.length > 0) {
                          e.preventDefault();
                          const uniqueEmails = Array.from(new Set(matches.map(m => m.trim().toLowerCase())));
                          setQuickTestRecipient(uniqueEmails.join(", "));
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200/80 focus:border-jago focus:ring-1 focus:ring-jago/20 hover:border-slate-300 rounded-lg text-xs transition-all font-bold text-slate-800 shadow-sm"
                    autoFocus
                  />
                </div>
              </div>

              <button 
                disabled={!quickTestRecipient}
                onClick={async () => {
                  window.dispatchEvent(new CustomEvent("apply-template", { detail: { subject: quickTestTemplate.subject, html: quickTestTemplate.message } }));
                  setActiveTab("send");
                  setQuickTestTemplate(null);
                }}
                className="w-full py-3 bg-jago hover:bg-jago-hover text-white text-[10px] font-bold rounded-xl border border-jago-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider shadow-md shadow-jago/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                KIRIM SEKARANG (FORM)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
