import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";
import { RichTextEditor } from "../RichTextEditor";

interface TemplateFormModalProps {
  showTemplateModal: boolean;
  editingTemplateId: string | null;
  templateForm: {
    name: string;
    category: "General" | "Marketing" | "Support" | "Personal";
    subject: string;
    message: string;
  };
  setTemplateForm: React.Dispatch<React.SetStateAction<{
    name: string;
    category: "General" | "Marketing" | "Support" | "Personal";
    subject: string;
    message: string;
  }>>;
  isSuggestingCategory: boolean;
  handleSuggestCategory: () => void;
  handleSaveTemplateSubmit: () => void;
  onClose: () => void;
  handleTemplateMessageChange: (val: string) => void;
}

export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  showTemplateModal,
  editingTemplateId,
  templateForm,
  setTemplateForm,
  isSuggestingCategory,
  handleSuggestCategory,
  handleSaveTemplateSubmit,
  onClose,
  handleTemplateMessageChange,
}) => {
  return (
    <AnimatePresence>
      {showTemplateModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-xl mx-auto rounded-t-[28px] sm:rounded-[28px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] my-auto text-slate-800"
          >
            {/* Mobile Handle Bar */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-slate-50 shrink-0">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {editingTemplateId ? "Ubah Template" : "Template Baru"}
              </h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 no-scrollbar bg-transparent flex-1 min-h-0">
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
                          <span className="w-3 h-3 css-spinner text-[#00aff0]" />
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

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                  Isi Pesan (HTML)
                </label>
                <RichTextEditor 
                  value={templateForm.message}
                  onChange={handleTemplateMessageChange}
                  placeholder=""
                  minHeight="180px"
                />
              </div>
            </div>

            <div className="px-6 py-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                onClick={handleSaveTemplateSubmit}
                className="w-full sm:flex-1 py-4 bg-[#00aff0] hover:bg-[#009bc3] text-white text-sm font-black rounded-2xl border border-[#008cc3] transition-all shadow-md active:scale-[0.98] order-1 sm:order-2 cursor-pointer uppercase tracking-wider"
              >
                Simpan Template
              </button>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-4 text-sm font-black text-slate-500 hover:text-slate-800 order-2 sm:order-1 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
