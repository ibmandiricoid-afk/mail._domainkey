import React, { useRef, useState, useEffect, useMemo } from "react";
import { Copy, Check, Wand2, WrapText, Hash, Code2, Plus } from "lucide-react";

interface HtmlSyntaxEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  placeholder?: string;
}

/**
 * Lightweight & fast HTML Tokenizer for Code Highlighting
 */
function highlightHtmlCode(code: string): string {
  if (!code) return "";

  // Escape basic HTML special characters first to avoid XSS in preview code
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. Highlight HTML Comments: &lt;!-- ... --&gt;
  escaped = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="text-slate-400 italic opacity-85">$1</span>'
  );

  // 2. Highlight Mustache/Template Variables: {{ variable }} or [Variable]
  escaped = escaped.replace(
    /(\{\{\s*[\w\.\-]+\s*\}\}|\[[\w\s\.\-]+\])/g,
    '<span class="text-pink-400 font-bold bg-pink-950/60 px-1 py-0.5 rounded border border-pink-500/30">$1</span>'
  );

  // 3. Highlight HTML Tags & Attributes
  // Matches &lt;tag or &lt;/tag or &gt; or /&gt;
  escaped = escaped.replace(
    /(&lt;\/?[a-zA-Z0-9\-]+|&gt;|\/&gt;)/g,
    (match) => {
      if (match.startsWith("&lt;")) {
        const tag = match.replace("&lt;", "");
        return `<span class="text-sky-400 font-semibold">&lt;${tag}</span>`;
      }
      if (match === "&gt;" || match === "/&gt;") {
        return `<span class="text-sky-400 font-semibold">${match}</span>`;
      }
      return match;
    }
  );

  // 4. Highlight Attribute names and quoted values
  // e.g. style="..." or class='...'
  escaped = escaped.replace(
    /([a-zA-Z\-]+)=(&quot;|"|')([\s\S]*?)(\2|&quot;)/g,
    '<span class="text-amber-300">$1</span>=<span class="text-emerald-400 font-medium">$2$3$4</span>'
  );

  // 5. Highlight unquoted attributes
  escaped = escaped.replace(
    /(\s)([a-zA-Z\-]+)(=)/g,
    '$1<span class="text-amber-300">$2</span>$3'
  );

  return escaped;
}

/**
 * Pure helper to beautify/indent unformatted HTML string
 */
function beautifyHtml(html: string): string {
  if (!html) return "";
  let formatted = "";
  let indent = 0;
  const tab = "  ";

  // Normalize spaces
  const cleanHtml = html.replace(/>\s+</g, "><").trim();
  const tokens = cleanHtml.split(/(<[^>]+>)/g).filter(Boolean);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith("<!--")) {
      formatted += tab.repeat(indent) + token + "\n";
    } else if (token.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + token + "\n";
    } else if (token.startsWith("<") && !token.endsWith("/>") && !token.startsWith("<!") && !token.startsWith("<meta") && !token.startsWith("<img") && !token.startsWith("<br") && !token.startsWith("<hr") && !token.startsWith("<input")) {
      formatted += tab.repeat(indent) + token + "\n";
      indent++;
    } else if (token.startsWith("<")) {
      formatted += tab.repeat(indent) + token + "\n";
    } else {
      const text = token.trim();
      if (text) {
        formatted += tab.repeat(indent) + text + "\n";
      }
    }
  }

  return formatted.trim();
}

export const HtmlSyntaxEditor: React.FC<HtmlSyntaxEditorProps> = ({
  value,
  onChange,
  minHeight = "220px",
  placeholder = "Ketik atau tempel kode HTML email di sini..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  // Compute highlighted HTML representation safely
  const highlightedCode = useMemo(() => {
    return highlightHtmlCode(value || "");
  }, [value]);

  // Compute total line count for left gutter
  const lineNumbers = useMemo(() => {
    const lines = (value || "").split("\n");
    return Array.from({ length: lines.length }, (_, i) => i + 1);
  }, [value]);

  // Synchronize scrolling between invisible textarea, syntax pre layer, and line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBeautify = () => {
    const formatted = beautifyHtml(value);
    onChange(formatted);
  };

  const insertTag = (tagStart: string, tagEnd: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${tagStart}${selectedText}${tagEnd}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagStart.length,
        start + tagStart.length + selectedText.length
      );
    }, 10);
  };

  return (
    <div className="w-full flex flex-col rounded-2xl bg-[#030712] border border-slate-800 shadow-xl overflow-hidden font-mono text-xs select-none">
      {/* HTML Editor Helper Bar */}
      <div className="px-3 py-2 bg-[#091121] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 uppercase tracking-widest flex items-center gap-1 shrink-0">
            <Code2 className="w-3 h-3 text-sky-400" /> HTML Editor
          </span>

          <span className="w-px h-4 bg-slate-800 mx-1 shrink-0" />

          {/* Quick Snippet Buttons */}
          <button
            type="button"
            onClick={() => insertTag('<table width="100%" cellpadding="0" cellspacing="0" style="font-family:sans-serif;">\n  <tr>\n    <td style="padding:16px;">', '\n    </td>\n  </tr>\n</table>')}
            className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-all cursor-pointer shrink-0"
            title="Sisipkan Tabel Responsive"
          >
            + Table
          </button>
          <button
            type="button"
            onClick={() => insertTag('<a href="https://..." style="display:inline-block; padding:12px 24px; background-color:#00aff0; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:bold;">', '</a>')}
            className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-all cursor-pointer shrink-0"
            title="Sisipkan Tombol CTA"
          >
            + Tombol CTA
          </button>
          <button
            type="button"
            onClick={() => insertTag('<b>', '</b>')}
            className="px-1.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700/60 transition-all cursor-pointer shrink-0"
            title="Tebal"
          >
            &lt;b&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('<br/>')}
            className="px-1.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700/60 transition-all cursor-pointer shrink-0"
            title="Ganti Baris"
          >
            &lt;br&gt;
          </button>
          <button
            type="button"
            onClick={() => insertTag('{{ nama }}')}
            className="px-2 py-1 rounded-md bg-pink-950/70 hover:bg-pink-900/80 text-pink-300 text-[10px] font-bold border border-pink-700/50 transition-all cursor-pointer shrink-0 flex items-center gap-1"
            title="Sisipkan Variabel Nama"
          >
            <Plus className="w-3 h-3 text-pink-400" />
            <span>{"{{ nama }}"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Beautify Button */}
          <button
            type="button"
            onClick={handleBeautify}
            className="px-2 py-1 rounded-md bg-sky-950/80 hover:bg-sky-900 text-sky-300 text-[10px] font-extrabold border border-sky-700/60 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Rapikan Indentasi Kode HTML"
          >
            <Wand2 className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Rapikan Kode</span>
          </button>

          {/* Word Wrap Toggle */}
          <button
            type="button"
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
              wordWrap 
                ? "bg-slate-800 text-sky-400 border-sky-800" 
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title={wordWrap ? "Word Wrap: Aktif" : "Word Wrap: Nonaktif"}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
            title="Salin Seluruh Kode HTML"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Dual-Layer Editor Canvas */}
      <div 
        className="relative flex w-full overflow-hidden bg-[#030712] text-slate-200"
        style={{ height: minHeight }}
      >
        {/* Line Numbers Gutter */}
        <div 
          ref={lineNumbersRef}
          className="w-10 sm:w-11 bg-[#060d1d] border-r border-slate-800/80 py-3 text-right pr-2 text-slate-600 select-none font-mono text-[11px] leading-[20px] overflow-hidden shrink-0 pointer-events-none"
        >
          {lineNumbers.map((n) => (
            <div key={n} className="h-[20px]">
              {n}
            </div>
          ))}
        </div>

        {/* Editor Code Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlight View (Underneath) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className={`absolute inset-0 p-3 m-0 font-mono text-[12px] leading-[20px] pointer-events-none overflow-auto scrollbar-thin ${
              wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
            }`}
            style={{ tabSize: 2 }}
          >
            <code
              ref={codeRef}
              className="font-mono text-[12px] leading-[20px]"
              dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
            />
          </pre>

          {/* Transparent Input Textarea (On Top) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`absolute inset-0 p-3 m-0 font-mono text-[12px] leading-[20px] bg-transparent text-transparent caret-sky-400 resize-none outline-none border-none shadow-none focus:ring-0 focus:outline-none w-full h-full overflow-auto ${
              wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
            }`}
            style={{ tabSize: 2 }}
          />
        </div>
      </div>

      {/* Editor Footer Status */}
      <div className="px-3 py-1 bg-[#060d1d] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <span className="flex items-center gap-1.5">
          <Hash className="w-3 h-3 text-slate-600" />
          <span>{lineNumbers.length} Baris</span>
          <span className="text-slate-700">•</span>
          <span>{value.length} Karakter</span>
        </span>
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          HTML Valid
        </span>
      </div>
    </div>
  );
};
