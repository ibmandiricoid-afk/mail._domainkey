import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { RichTextEditor } from "../RichTextEditor";

interface TemplateFormModalProps {
  showTemplateModal: boolean;
  templateForm: {
    id?: string;
    name: string;
    category: "General" | "Marketing" | "Support" | "Personal";
    subject: string;
    message: string;
  };
  setTemplateForm: React.Dispatch<React.SetStateAction<{
    id?: string;
    name: string;
    category: "General" | "Marketing" | "Support" | "Personal";
    subject: string;
    message: string;
  }>>;
  isSuggestingCategory: boolean;
  handleSuggestCategory: () => void;
  handleSaveTemplateSubmit: () => void;
  onClose: () => void;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  showTemplateModal,
  templateForm,
  setTemplateForm,
  isSuggestingCategory,
  handleSuggestCategory,
  handleSaveTemplateSubmit,
  onClose,
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden w-full h-full max-w-full left-0 top-0 right-0 bottom-0">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:w-full max-w-xl mx-auto rounded-t-[28px] sm:rounded-[28px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] text-slate-800 max-w-full relative z-10"
          >
            {/* Mobile Handle Bar */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-slate-50 shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {templateForm.id ? "Ubah Template" : "Template Baru"}
              </h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-6 no-scrollbar bg-transparent flex-1 min-h-0 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                    Nama Template
                  </label>
                  <input 
                    type="text" 
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm outline-none focus:border-jago focus:ring-1 focus:ring-jago/20 transition-all font-bold text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest">
                      Kategori
                    </label>
                    <button
                      type="button"
                      onClick={handleSuggestCategory}
                      disabled={isSuggestingCategory || (!templateForm.subject && !templateForm.message)}
                      className="text-[9px] font-black text-[#00aff0] hover:text-[#008cc3] disabled:opacity-40 uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none transition-all active:scale-95"
                      title="Gunakan AI untuk merekomendasikan kategori otomatis berdasarkan subjek/pesan"
                    >
                      {isSuggestingCategory ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-[#00aff0]" />
                          <span>Menganalisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#00aff0] fill-[#00aff0]" />
                          <span>Saran AI ✨</span>
                        </>
                      )}
                    </button>
                  </div>
                  <select 
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value as any })}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm outline-none focus:border-jago focus:ring-1 focus:ring-jago/20 transition-all font-bold text-slate-800 shadow-sm cursor-pointer"
                  >
                    <option value="General" className="bg-white text-slate-800">General</option>
                    <option value="Marketing" className="bg-white text-slate-800">Marketing</option>
                    <option value="Support" className="bg-white text-slate-800">Support</option>
                    <option value="Personal" className="bg-white text-slate-800">Personal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest px-1">
                  Subjek Bawaan
                </label>
                <input 
                  type="text" 
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-sm outline-none focus:border-jago focus:ring-1 focus:ring-jago/20 transition-all font-bold text-slate-800 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col min-h-0 w-full max-w-full">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                  Isi Pesan (HTML)
                </label>
                <div className="w-full max-w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                  <RichTextEditor 
                    value={templateForm.message}
                    onChange={(val) => setTemplateForm((prev) => ({ ...prev, message: val }))}
                    placeholder=""
                    minHeight="180px"
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 shrink-0">
              <button 
                onClick={handleSaveTemplateSubmit}
                className="w-full sm:flex-1 py-3 bg-[#00aff0] hover:bg-[#009bc3] text-white text-xs font-black rounded-xl border border-[#008cc3] transition-all shadow-md active:scale-[0.98] order-1 sm:order-2 cursor-pointer uppercase tracking-wider"
              >
                Simpan Template
              </button>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-black text-slate-500 hover:text-slate-800 order-2 sm:order-1 transition-colors cursor-pointer text-center"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
