import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { EmailTemplate } from "../../types";

interface DeleteConfirmModalProps {
  templateToDelete: EmailTemplate | null;
  setTemplateToDelete: (template: EmailTemplate | null) => void;
  deleteTemplate: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  templateToDelete,
  setTemplateToDelete,
  deleteTemplate,
}) => {
  return (
    <AnimatePresence>
      {templateToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-[340px] mx-auto rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center relative overflow-hidden text-slate-800"
          >
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-500">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Hapus Template?
            </h3>
            
            <p className="text-xs text-slate-500 font-bold mb-6">
              Apakah Anda yakin ingin menghapus template <span className="text-slate-800">"{templateToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setTemplateToDelete(null)}
                className="flex-1 py-2 text-[10px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                BATAL
              </button>
              <button 
                onClick={() => {
                  deleteTemplate(templateToDelete.id);
                  setTemplateToDelete(null);
                }}
                className="flex-1 py-2 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg cursor-pointer"
              >
                HAPUS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
