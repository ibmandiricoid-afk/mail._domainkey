import React, { useRef, useEffect, useState } from "react";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link2, Type, Palette, Code, Eye, Eraser,
  ChevronDown, Sparkles, Briefcase, Zap, Smile, Target
} from "lucide-react";
import { HtmlSyntaxEditor } from "./HtmlSyntaxEditor";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({
  value,
  onChange,
  placeholder = "Tulis pesan Anda di sini...",
  minHeight = "200px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);
  const [isImprovingTone, setIsImprovingTone] = useState(false);
  const [toneSuccessMsg, setToneSuccessMsg] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // Keep raw HTML input in sync with value ONLY when transitioning to/from HTML mode or when editor has stopped typing
  useEffect(() => {
    if (isHtmlMode) {
      setHtmlValue(value);
    }
  }, [isHtmlMode, value]);

  // Handle setting initial value or external value changes without resetting cursor while typing
  useEffect(() => {
    if (editorRef.current) {
      if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      // Avoid calling setHtmlValue(html) in visual mode to save another state update
      if (isHtmlMode) {
        setHtmlValue(html);
      }
    }
  };

  const executeCommand = (command: string, argument: string = "") => {
    document.execCommand(command, false, argument);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormat((prev) => {
      const bold = document.queryCommandState("bold");
      const italic = document.queryCommandState("italic");
      const underline = document.queryCommandState("underline");
      // Only set state if any format has actually changed
      if (prev.bold !== bold || prev.italic !== italic || prev.underline !== underline) {
        return { bold, italic, underline };
      }
      return prev;
    });
  };

  // We listen to keyup/mouseup/focus events on the editor contentEditable instead of a global document selectionchange
  const handleEditorInteract = () => {
    updateActiveFormats();
  };

  const insertLink = () => {
    const url = prompt("Masukkan URL Link:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const setTextColor = (color: string) => {
    executeCommand("foreColor", color);
  };

  const setFontSize = (size: string) => {
    // execCommand "fontSize" accepts 1-7
    executeCommand("fontSize", size);
  };

  const handlePaste = () => {
    // Default pasting in contentEditable retains HTML and inline styles 1:1.
    // If they paste, trigger the onChange handler right after paste event finishes.
    setTimeout(() => {
      handleInput();
    }, 50);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setHtmlValue(newVal);
    onChange(newVal);
  };

  const handleImproveTone = async (toneKey: "professional" | "urgent" | "friendly" | "persuasive") => {
    if (isImprovingTone) return;

    let textToImprove = "";
    let isSelection = false;
    let selObj: Selection | null = null;
    let rangeObj: Range | null = null;

    if (typeof window !== "undefined") {
      selObj = window.getSelection();
      if (selObj && selObj.rangeCount > 0 && !selObj.isCollapsed) {
        textToImprove = selObj.toString();
        if (textToImprove.trim().length > 0) {
          isSelection = true;
          rangeObj = selObj.getRangeAt(0);
        }
      }
    }

    // Fallback to full content if no selection
    if (!isSelection || !textToImprove.trim()) {
      textToImprove = isHtmlMode ? htmlValue : (editorRef.current?.innerHTML || value);
    }

    if (!textToImprove || !textToImprove.trim()) return;

    setIsImprovingTone(true);

    try {
      const res = await fetch("/api/gemini/improve-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToImprove, tone: toneKey })
      });

      const data = await res.json();
      if (data.improvedText) {
        const newText = data.improvedText;

        if (isSelection && selObj && rangeObj && !isHtmlMode) {
          selObj.removeAllRanges();
          selObj.addRange(rangeObj);
          document.execCommand("insertHTML", false, newText);
          handleInput();
        } else if (isHtmlMode) {
          setHtmlValue(newText);
          onChange(newText);
        } else {
          if (editorRef.current) {
            editorRef.current.innerHTML = newText;
          }
          onChange(newText);
        }

        const labels: Record<string, string> = {
          professional: "Profesional",
          urgent: "Mendesak (Urgent)",
          friendly: "Ramah & Hangat",
          persuasive: "Persuasif"
        };
        setToneSuccessMsg(`Nada draf berhasil disempurnakan ke '${labels[toneKey] || toneKey}' via Gemini AI!`);
        setTimeout(() => setToneSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error("Gagal meningkatkan tone:", err);
    } finally {
      setIsImprovingTone(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-inner ring-1 ring-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-1.5 bg-slate-50 border-b border-slate-200 select-none overflow-hidden">
        {!isHtmlMode ? (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 whitespace-nowrap py-1 pr-2 scroll-smooth">
            {/* Formatting Actions */}
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFormat.bold ? "bg-[#00aff0] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
              title="Tebal (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFormat.italic ? "bg-[#00aff0] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
              title="Miring (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                activeFormat.underline ? "bg-[#00aff0] text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
              }`}
              title="Garis Bawah (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => executeCommand("justifyLeft")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Rata Kiri"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyCenter")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Rata Tengah"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("justifyRight")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Rata Kanan"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Lists */}
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Daftar Simbol"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Daftar Nomor"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Font Size Dropdown */}
            <div className="relative group/size flex items-center shrink-0">
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title="Ukuran Font"
              >
                <Type className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 hidden group-hover/size:block min-w-[120px]">
                {[
                  { label: "Sangat Kecil", size: "1" },
                  { label: "Kecil", size: "2" },
                  { label: "Normal", size: "3" },
                  { label: "Sedang", size: "4" },
                  { label: "Besar", size: "5" },
                  { label: "Sangat Besar", size: "6" },
                  { label: "Raksasa", size: "7" }
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => setFontSize(item.size)}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color Dropdown */}
            <div className="relative group/color flex items-center shrink-0">
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title="Warna Teks"
              >
                <Palette className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-50 hidden group-hover/color:block">
                <div className="grid grid-cols-5 gap-1.5 min-w-[140px]">
                  {[
                    "#000000", "#475569", "#dc2626", "#ea580c", "#ca8a04",
                    "#16a34a", "#059669", "#0284c7", "#2563eb", "#7c3aed",
                    "#db2777", "#ffffff", "#f1f5f9", "#fee2e2", "#dcfce7"
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTextColor(color)}
                      style={{ backgroundColor: color }}
                      className="w-5 h-5 rounded border border-slate-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Link & Unsubscribe & Clear */}
            <button
              type="button"
              onClick={insertLink}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Sisipkan Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("removeFormat")}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer shrink-0"
              title="Hapus Format"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Gemini AI Improve Tone Dropdown */}
            <div className="relative group/tone flex items-center shrink-0">
              <button
                type="button"
                disabled={isImprovingTone}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 font-medium text-xs shadow-xs"
                title="Ubah & Sempurnakan Nada Bahasa dengan Gemini AI"
              >
                {isImprovingTone ? (
                  <span className="w-3.5 h-3.5 css-spinner text-amber-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                )}
                <span className="text-xs font-semibold text-amber-950 hidden xs:inline">
                  {isImprovingTone ? "Proses Gemini..." : "Ubah Nada"}
                </span>
                <ChevronDown className="w-3 h-3 text-amber-700" />
              </button>

              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 hidden group-hover/tone:block min-w-[210px]">
                <div className="px-2.5 py-1 text-[10px] font-bold text-amber-800 bg-amber-50 rounded-md mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Gemini Tone Improver</span>
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleImproveTone("professional")}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Lebih Profesional</div>
                    <div className="text-[10px] text-slate-500">Bahasa bisnis formal & sopan</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleImproveTone("urgent")}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Lebih Mendesak (Urgent)</div>
                    <div className="text-[10px] text-slate-500">Urgensi tinggi & panggilan bertindak</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleImproveTone("friendly")}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Lebih Ramah & Hangat</div>
                    <div className="text-[10px] text-slate-500">Komunikatif & mudah dipahami</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleImproveTone("persuasive")}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Target className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Lebih Persuasif</div>
                    <div className="text-[10px] text-slate-500">Memikat & menonjolkan manfaat</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden pr-2">
            <span className="text-[9px] sm:text-[10px] font-bold text-[#008cc3] bg-sky-50 px-2 py-1 rounded border border-sky-200 uppercase tracking-wider block truncate shadow-sm">
              Mode Editor HTML (Kode Sumber)
            </span>
          </div>
        )}

        <div className="flex items-center shrink-0 border-l border-slate-200 pl-1.5 gap-1.5">
          {/* HTML Source Toggle */}
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="px-2 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shrink-0"
            title={isHtmlMode ? "Beralih ke Visual" : "Beralih ke Kode HTML"}
          >
            {isHtmlMode ? (
              <>
                <Eye className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Visual</span>
              </>
            ) : (
              <>
                <Code className="w-3.5 h-3.5" /> <span className="hidden xs:inline">HTML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overflow-x-hidden w-full transition-colors duration-200 bg-slate-50/50 p-1 sm:p-2 flex flex-col items-center"
        style={{ minHeight }}
      >
        {/* Tone Improvement Toast Notification */}
        {toneSuccessMsg && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg border border-amber-300/40 flex items-center gap-1.5 animate-fade-in pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 fill-amber-200 shrink-0" />
            <span>{toneSuccessMsg}</span>
          </div>
        )}
        {!isHtmlMode ? (
          <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyUp={handleEditorInteract}
              onMouseUp={handleEditorInteract}
              onFocus={handleEditorInteract}
              className="bg-white p-3 sm:p-3.5 shadow-xs rounded-xl border border-slate-200/90 text-slate-800 text-sm focus:outline-none leading-relaxed select-text w-full max-w-[480px] box-border overflow-x-hidden"
              style={{ 
                minHeight
              }}
              data-placeholder={placeholder}
            />
          </div>
        ) : (
          <div className="w-full max-w-[480px] mx-auto flex flex-col items-center">
            <HtmlSyntaxEditor
              value={htmlValue}
              onChange={(newVal) => {
                setHtmlValue(newVal);
                onChange(newVal);
              }}
              minHeight={minHeight}
              placeholder={placeholder}
            />
          </div>
        )}
      </div>

      {/* Styles to support placeholder on contenteditable and scrollbar hiding */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
        }
        [contenteditable] {
          outline: none;
          box-sizing: border-box !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        /* Universal responsive scaling for all inner template elements */
        [contenteditable] * {
          box-sizing: border-box !important;
          max-width: 100% !important;
        }
        /* Ensure email tables, containers, and elements fit symmetrically inside preview box */
        [contenteditable] table {
          max-width: 100% !important;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          box-sizing: border-box !important;
          border-collapse: collapse !important;
          table-layout: auto !important;
        }
        [contenteditable] img {
          max-width: 100% !important;
          height: auto !important;
          margin-left: auto !important;
          margin-right: auto !important;
          display: block !important;
        }
        [contenteditable] div, 
        [contenteditable] section, 
        [contenteditable] td,
        [contenteditable] th,
        [contenteditable] p {
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
        }
        /* Prevent excessive nested padding on small mobile viewports */
        @media (max-width: 640px) {
          [contenteditable] td {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          [contenteditable] table.main-card,
          [contenteditable] .main-card {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 8px !important;
          }
        }
        /* Style standard tag output for consistent contenteditable visual representation */
        [contenteditable] ul {
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin: 8px 0 !important;
        }
        [contenteditable] ol {
          list-style-type: decimal !important;
          padding-left: 24px !important;
          margin: 8px 0 !important;
        }
        [contenteditable] blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 12px;
          color: #475569;
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
});
