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
      style={{ flex: "1 1 auto", height: "100%" }}
      className="px-1.5 sm:px-4 md:px-6 py-2 sm:py-3 w-full max-w-7xl mx-auto flex flex-col justify-between flex-1 h-full min-h-[calc(100dvh-125px)] pb-24 landscape:py-1.5"
    >
      <div style={{ flex: "1 1 auto", height: "100%" }} className="flex-1 flex flex-col w-full h-full min-h-0">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 gap-2 px-0.5 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Cari template, subjek, kategori..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 text-slate-800 placeholder:text-slate-400/80 outline-none transition-all shadow-xs"
            />
          </div>

          <button 
            onClick={() => {
              setTemplateForm({ name: "", category: "General", subject: "", message: "" });
              setShowTemplateModal(true);
            }}
            className="h-8 sm:h-9 px-3 bg-jago hover:bg-jago-hover text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-jago/10 transition-all active:scale-95 shrink-0 cursor-pointer font-black text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Template</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 w-full min-h-0 flex-1">
          {visibleTemplates.map((t) => (
            <motion.div 
              key={t.id}
              layout
              style={{ height: "100%", flex: "1 1 auto" }}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between w-full min-w-0 h-full"
            >
              <div className="p-3 flex flex-col justify-between gap-2 min-w-0 h-full">
                <div className="min-w-0">
                  <div className="flex justify-between items-center mb-1.5 gap-2 min-w-0">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold uppercase rounded-md border border-slate-200/80 tracking-wider shrink-0 max-w-[140px] truncate text-truncate">
                      {t.category}
                    </span>
                    <button 
                      onClick={() => setTemplateToDelete(t)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0 active:scale-90"
                      title="Hapus Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-800 mb-0.5 leading-snug text-xs sm:text-[12.5px] truncate text-truncate min-w-0" title={t.name}>
                    {t.name}
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium truncate text-truncate leading-tight min-w-0" title={t.subject}>
                    {t.subject || "(Tanpa Subjek)"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 min-w-0 w-full mt-1">
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => startEditTemplate(t)}
                      className="w-7 h-7 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Edit Draft"
                    >
                      <Pen className="w-3 h-3 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => setPreviewTemplate(t)}
                      className="w-7 h-7 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Pratinjau"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => setQuickTestTemplate(t)}
                      className="w-7 h-7 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                      title="Kirim Tes"
                    >
                      <Send className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                  <button 
                    onClick={() => useTemplateContent(t)}
                    className="flex-1 min-w-0 h-7 bg-[#00aff0] hover:bg-[#009bc3] active:scale-[0.98] text-white text-[9px] sm:text-[9.5px] font-bold rounded-lg transition-all flex items-center justify-center shadow-2xs border border-[#008cc3] px-2 cursor-pointer uppercase tracking-wider"
                  >
                    <span className="truncate text-truncate">PAKAI TEMPLATE</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="py-16 text-center my-auto">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-800 font-black text-sm">Belum Ada Template</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Mulai dengan membuat draf email pertama Anda untuk pengiriman cepat.
            </p>
          </div>
        )}
      </div>

      {/* High-performance virtual observer checkpoint & manual fallback activator */}
      {filteredTemplates.length > visibleCount && (
        <div 
          ref={loaderRef} 
          className="mt-6 py-4 flex flex-col items-center justify-center gap-1.5 border-t border-dashed border-slate-200/80 shrink-0"
        >
          <div className="w-5 h-5 border-2 border-jago border-t-transparent rounded-full animate-spin" />
          <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
            Memuat template tambahan secara otomatis...
          </p>
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredTemplates.length))}
            className="mt-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9.5px] font-extrabold text-slate-600 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Tampilkan Manual (+12 Template)
          </button>
        </div>
      )}
    </motion.div>
  );
});
