import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, Plus, Trash2, Pen, Eye, Send, FileText } from "lucide-react";
import { motion } from "motion/react";
import { EmailTemplate } from "../types";

interface TemplatesTabProps {
  templates: EmailTemplate[];
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
  setEditingTemplateId: (id: string | null) => void;
  setTemplateForm: (form: { name: string; category: "General" | "Marketing" | "Support" | "Personal"; subject: string; message: string }) => void;
  setShowTemplateModal: (show: boolean) => void;
  setTemplateToDelete: (template: EmailTemplate | null) => void;
  setPreviewTemplate: (template: EmailTemplate | null) => void;
  setQuickTestTemplate: (template: EmailTemplate | null) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = React.memo(({
  templates,
  setActiveTab,
  setEditingTemplateId,
  setTemplateForm,
  setShowTemplateModal,
  setTemplateToDelete,
  setPreviewTemplate,
  setQuickTestTemplate
}) => {
  const [templateSearch, setTemplateSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const filteredTemplates = useMemo(() => {
    const searchLower = templateSearch.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
    );
  }, [templates, templateSearch]);

  // Reset visibleCount when search changes to show initial clean set
  useEffect(() => {
    setVisibleCount(12);
  }, [templateSearch]);

  // Infinite Scroll / Progressive windowing intersection observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, filteredTemplates.length));
        }
      },
      { rootMargin: "200px" } // trigger load slightly before reaching screen bottom
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [filteredTemplates.length]);

  const startEditTemplate = useCallback((t: EmailTemplate) => {
    setTemplateForm({
      name: t.name,
      category: t.category,
      subject: t.subject,
      message: t.message
    });
    setEditingTemplateId(t.id);
    setShowTemplateModal(true);
  }, [setTemplateForm, setEditingTemplateId, setShowTemplateModal]);

  const useTemplateContent = useCallback((t: EmailTemplate) => {
    window.dispatchEvent(new CustomEvent("use-template", { detail: t }));
    setActiveTab("send");
  }, [setActiveTab]);

  const visibleTemplates = useMemo(() => {
    return filteredTemplates.slice(0, visibleCount);
  }, [filteredTemplates, visibleCount]);


  return (
    <motion.div
      key="templates-view"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 w-full max-w-7xl mx-auto pb-28"
    >
      <div className="flex flex-col justify-between items-start mb-4 gap-3 px-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Template Email
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 text-slate-800 placeholder:text-slate-400/80 outline-none transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => {
              setEditingTemplateId(null);
              setTemplateForm({ name: "", category: "General", subject: "", message: "" });
              setShowTemplateModal(true);
            }}
            className="w-9 h-9 bg-jago hover:bg-jago-hover text-white rounded-xl flex items-center justify-center shadow-md shadow-jago/10 transition-all active:scale-90 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {visibleTemplates.map((t) => (
          <motion.div 
            key={t.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all group"
          >
            <div className="p-3.5 sm:p-5 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase rounded-full border border-slate-200">
                    {t.category}
                  </span>
                  <button 
                    onClick={() => setTemplateToDelete(t)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-extrabold text-slate-800 mb-1 leading-tight text-sm">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-500 font-bold mb-6 line-clamp-2 leading-relaxed">
                  {t.subject}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-1.5 xs:gap-2 items-center">
                <button 
                  onClick={() => startEditTemplate(t)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center shrink-0"
                  title="Edit Draft"
                >
                  <Pen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => setPreviewTemplate(t)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center shrink-0"
                  title="Pratinjau"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => setQuickTestTemplate(t)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center shrink-0"
                  title="Kirim Tes"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => useTemplateContent(t)}
                  className="flex-1 h-8 sm:h-10 bg-jago hover:bg-jago-hover text-white text-[9px] sm:text-[10px] font-black rounded-xl transition-all flex items-center justify-center shadow-md shadow-jago/10 border border-jago-dark truncate px-1"
                >
                  PAKAI TEMPLATE
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* High-performance virtual observer checkpoint & manual fallback activator */}
      {filteredTemplates.length > visibleCount && (
        <div 
          ref={loaderRef} 
          className="mt-12 py-6 flex flex-col items-center justify-center gap-2 border-t border-dashed border-slate-200/80"
        >
          <div className="w-6 h-6 border-2 border-jago border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Memuat template tambahan secara otomatis...
          </p>
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredTemplates.length))}
            className="mt-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-600 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Tampilkan Manual (+12 Template)
          </button>
        </div>
      )}

      {templates.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-800 font-black">Belum Ada Template</h3>
          <p className="text-sm text-slate-500 font-bold mt-1">
            Mulai dengan membuat draf email pertama Anda untuk pengiriman cepat.
          </p>
        </div>
      )}
    </motion.div>
  );
});
