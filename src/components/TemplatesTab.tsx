import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, Plus, Trash2, Pen, Eye, Send, FileText } from "lucide-react";
import { motion } from "motion/react";
import { EmailTemplate } from "../types";

interface TemplatesTabProps {
  templates: EmailTemplate[];
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
  setTemplateForm: (form: { id?: string; name: string; category: "General" | "Marketing" | "Support" | "Personal"; subject: string; message: string }) => void;
  setShowTemplateModal: (show: boolean) => void;
  setTemplateToDelete: (template: EmailTemplate | null) => void;
  setPreviewTemplate: (template: EmailTemplate | null) => void;
  setQuickTestTemplate: (template: EmailTemplate | null) => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = React.memo(({
  templates,
  setActiveTab,
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
      id: t.id,
      name: t.name,
      category: t.category,
      subject: t.subject,
      message: t.message
    });
    setShowTemplateModal(true);
  }, [setTemplateForm, setShowTemplateModal]);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-1.5 sm:px-4 md:px-6 py-2 sm:py-3 w-full max-w-7xl mx-auto pb-28 landscape:py-1.5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3.5 sm:mb-5 gap-2.5 sm:gap-4 px-0.5">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Template Email ({filteredTemplates.length})
          </h2>
          <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
            Koleksi rancangan email siap pakai & cepat disesuaikan
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[280px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Cari template, subjek, kategori..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 text-slate-800 placeholder:text-slate-400/80 outline-none transition-all shadow-xs"
            />
          </div>

          <button 
            onClick={() => {
              setTemplateForm({ name: "", category: "General", subject: "", message: "" });
              setShowTemplateModal(true);
            }}
            className="h-9 px-3 bg-jago hover:bg-jago-hover text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-jago/10 transition-all active:scale-95 shrink-0 cursor-pointer font-black text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Buat Template</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5 w-full">
        {visibleTemplates.map((t) => (
          <motion.div 
            key={t.id}
            layout
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all group flex flex-col justify-between w-full min-w-0 h-full min-h-[170px] aspect-[16/11] sm:aspect-auto"
          >
            <div className="p-3.5 sm:p-4 flex flex-col h-full justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <div className="flex justify-between items-center mb-2 gap-2 min-w-0">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[9.5px] font-extrabold uppercase rounded-full border border-slate-200/90 tracking-wide shrink-0 max-w-[150px] truncate">
                    {t.category}
                  </span>
                  <button 
                    onClick={() => setTemplateToDelete(t)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0 active:scale-90"
                    title="Hapus Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-extrabold text-slate-800 mb-1 leading-snug text-xs sm:text-sm break-words line-clamp-2 min-w-0">
                  {t.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mb-1 sm:mb-3 line-clamp-2 leading-relaxed break-words min-w-0">
                  {t.subject || "(Tanpa Subjek)"}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5 min-w-0 w-full mt-auto">
                <button 
                  onClick={() => startEditTemplate(t)}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Edit Draft"
                >
                  <Pen className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button 
                  onClick={() => setPreviewTemplate(t)}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Pratinjau"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button 
                  onClick={() => setQuickTestTemplate(t)}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  title="Kirim Tes"
                >
                  <Send className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button 
                  onClick={() => useTemplateContent(t)}
                  className="flex-1 min-w-0 h-8 sm:h-9 bg-jago hover:bg-jago-hover active:scale-[0.98] text-white text-[9px] xs:text-[9.5px] sm:text-[10px] font-black rounded-xl transition-all flex items-center justify-center shadow-md shadow-jago/10 border border-jago-dark px-1.5 sm:px-2.5 cursor-pointer uppercase tracking-tight"
                >
                  <span className="truncate">PAKAI TEMPLATE</span>
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
