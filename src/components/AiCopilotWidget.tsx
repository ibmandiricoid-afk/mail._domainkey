import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Sparkles, AlertCircle, Send, FileText, Image, X, Cpu, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EmailTemplate } from "../types";
import jarvisBg from "../assets/images/jarvis_cool_background_1783882128944.jpg";
import { hn, getHtmlLinks } from "../lib/utils";

// No-op sound trigger for performance
const playSciFiSound = (_type?: string) => {};

// Helper to update a link in an HTML string
const updateHtmlLink = (html: string, index: number, newText: string, newHref: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = doc.querySelectorAll("a");
    if (anchors[index]) {
      anchors[index].textContent = newText;
      anchors[index].setAttribute("href", newHref);
      if (html.toLowerCase().includes("<html")) {
        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      }
      return doc.body.innerHTML;
    }
  } catch (e) {
    console.error("Error updating link:", e);
  }
  return html;
};

interface LinkEditorProps {
  templateHtml: string;
  onLinkUpdate: (newHtml: string) => void;
}

const LinkEditor: React.FC<LinkEditorProps> = React.memo(({ templateHtml, onLinkUpdate }) => {
  const links = useMemo(() => getHtmlLinks(templateHtml), [templateHtml]);

  if (links.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#00aff0] uppercase tracking-widest font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-pulse" />
        Kustomisasi Tombol & Link Draf:
      </div>
      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
        {links.map((link, linkIdx) => (
          <div key={linkIdx} className="p-2 bg-white border border-slate-200/60 rounded-lg space-y-2">
            <div className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Tombol #{linkIdx + 1}: "{link.text}"</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Teks Tombol
                </label>
                <input
                  type="text"
                  value={link.text}
                  onChange={(e) => {
                    const newHtml = updateHtmlLink(templateHtml, link.index, e.target.value, link.href);
                    onLinkUpdate(newHtml);
                  }}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold focus:outline-none focus:border-[#00aff0] text-slate-800 placeholder:text-slate-400 transition-all"
                />
              </div>
              <div>
                <label className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Link Tujuan (URL)
                </label>
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => {
                    const newHtml = updateHtmlLink(templateHtml, link.index, link.text, e.target.value);
                    onLinkUpdate(newHtml);
                  }}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold focus:outline-none focus:border-[#00aff0] text-slate-800 placeholder:text-slate-400 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const getSafeSrcDoc = (html: string) => {
  if (!html) return "";
  
  const scaleInject = `
    <style>
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        background-color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      #email-wrapper {
        width: 600px !important;
        position: absolute !important;
        top: 4px !important;
        left: 50% !important;
        transform-origin: top center !important;
        box-sizing: border-box !important;
        margin: 0 auto !important;
      }
    </style>
    <script>
      (function() {
        function scaleEmail() {
          var wrapper = document.getElementById('email-wrapper');
          if (!wrapper) return;
          
          var cWidth = document.documentElement.clientWidth || window.innerWidth;
          var cHeight = document.documentElement.clientHeight || window.innerHeight;
          if (!cWidth || !cHeight || cWidth <= 0 || cHeight <= 0) return;
          
          var targetWidth = 600;
          var contentHeight = wrapper.offsetHeight || 350;
          
          var scaleX = (cWidth - 12) / targetWidth;
          var scaleY = (cHeight - 12) / contentHeight;
          
          // Fit both width and height inside the preview iframe box
          var scale = Math.min(scaleX, scaleY);
          if (scale > 1) scale = 1;
          if (scale < 0.15) scale = 0.15;
          
          wrapper.style.transform = 'translateX(-50%) scale(' + scale + ')';
        }

        function init() {
          if (!document.getElementById('email-wrapper')) {
            var wrapper = document.createElement('div');
            wrapper.id = 'email-wrapper';
            while (document.body.firstChild) {
              wrapper.appendChild(document.body.firstChild);
            }
            document.body.appendChild(wrapper);
          }
          scaleEmail();
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          init();
        } else {
          document.addEventListener('DOMContentLoaded', init);
        }

        window.addEventListener('resize', scaleEmail);
        window.addEventListener('load', scaleEmail);
        setTimeout(scaleEmail, 30);
        setTimeout(scaleEmail, 100);
        setTimeout(scaleEmail, 300);
        setTimeout(scaleEmail, 600);
        setTimeout(scaleEmail, 1000);
      })();
    </script>
  `;

  if (html.toLowerCase().includes("</body>")) {
    return html.replace(/<\/body>/i, `${scaleInject}</body>`);
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${html}
        ${scaleInject}
      </body>
    </html>
  `;
};

interface ChatMessageItemProps {
  msg: {
    role: "user" | "model";
    content: string;
    template?: any;
    image?: { data: string; mimeType: string; name: string };
    providerUsed?: string;
    modelUsed?: string;
    latencyMs?: number;
  };
  _idx?: number;
  editMode: "preview" | "html";
  setEditMode: (mode: "preview" | "html") => void;
  isAiLoading: boolean;
  handleSendAiMessage: (prompt: string) => void;
  applyAiTemplateToForm: () => void;
  saveAiTemplateToCollection: () => void;
  onTemplateSubjectChange: (newSubject: string) => void;
  onTemplateHtmlChange: (newHtml: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({
  msg,
  editMode,
  setEditMode,
  isAiLoading,
  handleSendAiMessage,
  applyAiTemplateToForm,
  saveAiTemplateToCollection,
  onTemplateSubjectChange,
  onTemplateHtmlChange
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);

  const handleCopyHtml = () => {
    if (!msg.template?.html) return;
    navigator.clipboard.writeText(msg.template.html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div
      className={hn(
        "flex flex-col max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs transition-all duration-300 relative z-10",
        msg.role === "user"
          ? "bg-[#00aff0] text-white rounded-br-none ml-auto border border-[#008cc3] shadow-md shadow-[#00aff0]/20 font-extrabold animate-fade-in"
          : "bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none mr-auto shadow-sm animate-fade-in"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
        <span className={msg.role === "user" ? "text-sky-100" : "text-slate-400"}>
          {msg.role === "user" ? "Anda" : "JARVIS"}
        </span>
        {msg.role === "model" && msg.providerUsed && (
          <span className="text-[7.5px] font-mono font-extrabold text-slate-700 bg-slate-200/90 border border-slate-300/80 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
            <Cpu className="w-2.5 h-2.5 text-[#00aff0]" />
            <span>{msg.providerUsed}</span>
            {msg.modelUsed && <span className="opacity-80 font-normal">({msg.modelUsed})</span>}
            {typeof msg.latencyMs === "number" && (
              <span className="text-emerald-700 font-extrabold ml-0.5 border-l border-slate-300 pl-1">
                ⚡ {msg.latencyMs}ms
              </span>
            )}
          </span>
        )}
      </div>
      
      {msg.image && (
        <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 max-w-[180px]">
          <img 
            src={`data:${msg.image.mimeType};base64,${msg.image.data}`} 
            alt={msg.image.name} 
            className="w-full h-auto object-cover max-h-[140px]"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <p className={hn("font-semibold leading-relaxed whitespace-pre-wrap", msg.role === "user" ? "text-white" : "text-slate-800")}>
        {msg.content}
      </p>

      {/* Contextual instant actions cards under generated drafts */}
      {!isAiLoading && msg.role === "model" && msg.template && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
          <div className="w-full text-[8px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mb-1">
            ⚡ MODIFIKASI CEPAT:
          </div>
          <button
            type="button"
            onClick={() => handleSendAiMessage("Terjemahkan draf email di atas ke Bahasa Inggris (English) dengan struktur formal perbankan.")}
            className="copilot-chip cursor-pointer text-[10px] font-medium py-1 px-2.5"
          >
            🇬🇧 Inggris
          </button>
          <button
            type="button"
            onClick={() => handleSendAiMessage("Perpendek draf email di atas agar sangat padat, singkat, dan langsung pada intinya.")}
            className="copilot-chip cursor-pointer text-[10px] font-medium py-1 px-2.5"
          >
            ⚡ Singkatkan
          </button>
          <button
            type="button"
            onClick={() => handleSendAiMessage("Ubah gaya bahasa draf email di atas menjadi jauh lebih formal, sopan, elegan, dan profesional.")}
            className="copilot-chip cursor-pointer text-[10px] font-medium py-1 px-2.5"
          >
            👔 Lebih Formal
          </button>
          <button
            type="button"
            onClick={() => handleSendAiMessage("Tulis ulang draf email di atas dengan menambahkan penekanan urgensi keamanan tingkat tinggi agar nasabah segera bertindak.")}
            className="copilot-chip cursor-pointer text-[10px] font-medium py-1 px-2.5"
          >
            🚨 Tambah Urgensi
          </button>
        </div>
      )}

      {/* Display template suggestions inside the chat if present */}
      {msg.template && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200 space-y-2.5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
            <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Subjek Rekomendasi (Dapat Diedit):
            </div>
            <input
              type="text"
              value={msg.template.subject}
              onChange={(e) => onTemplateSubjectChange(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#00aff0] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                Isi Pesan / Desain Template:
              </div>
              
              {/* Segmented Mode Control */}
              <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setEditMode('preview')}
                  className={hn(
                    "px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded transition-all",
                    editMode !== 'html' 
                      ? "bg-[#00aff0] text-white font-black" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode('html')}
                  className={hn(
                    "px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded transition-all",
                    editMode === 'html' 
                      ? "bg-[#00aff0] text-white font-black" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Edit Teks & HTML
                </button>
              </div>
            </div>

            {editMode === 'html' ? (
              <div className="w-full h-[280px] sm:h-[320px] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex flex-col relative">
                <textarea
                  value={msg.template.html}
                  onChange={(e) => onTemplateHtmlChange(e.target.value)}
                  className="w-full h-full p-3 bg-transparent text-slate-800 font-mono text-[10px] resize-none focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto"
                />
                <div className="absolute bottom-2 right-2 bg-slate-200 border border-slate-300 text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded text-slate-500 select-none font-mono">
                  Kode Sumber / Teks
                </div>
              </div>
            ) : (
              <div className="w-full h-[280px] sm:h-[320px] rounded-lg overflow-hidden border border-slate-200 bg-white">
                <iframe
                  title="AI Template Preview"
                  srcDoc={getSafeSrcDoc(msg.template.html)}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-popups allow-scripts"
                />
              </div>
            )}
          </div>

          {/* Custom Button & Link Editor Panel */}
          <LinkEditor
            templateHtml={msg.template.html}
            onLinkUpdate={onTemplateHtmlChange}
          />

          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={applyAiTemplateToForm}
              className="flex-1 min-w-[100px] py-2 bg-[#00aff0] hover:bg-[#009bc3] text-white text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all uppercase tracking-wider border border-[#008cc3] cursor-pointer"
            >
              <Send className="w-3 h-3" /> Gunakan di Form
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              className={hn(
                "py-2 px-2.5 text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all uppercase tracking-wider border cursor-pointer shrink-0",
                copiedHtml
                  ? "bg-emerald-500 text-white border-emerald-600"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              )}
            >
              {copiedHtml ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedHtml ? "Tersalin" : "Salin Teks"}
            </button>
            <button
              type="button"
              onClick={saveAiTemplateToCollection}
              className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all uppercase tracking-wider border border-slate-200 cursor-pointer shrink-0"
            >
              <FileText className="w-3 h-3" /> Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
ChatMessageItem.displayName = "ChatMessageItem";

interface AiCopilotWidgetProps {
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
  addLog: (type: "info" | "success" | "error" | "warning", msg: string) => void;
  templates: EmailTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
}

// Helper to generate bank credit card transaction Auto-Draft template
export const getBankAutoDraftTemplate = (bankName: string) => {
  const nameUpper = bankName.toUpperCase();
  let primaryColor = "#005baa"; // default BCA
  let headerTitle = "BANK BCA";
  let cardName = "Kartu Kredit BCA Visa Platinum";

  if (nameUpper.includes("MANDIRI")) {
    primaryColor = "#003d79";
    headerTitle = "BANK MANDIRI";
    cardName = "Kartu Kredit Mandiri Everyday";
  } else if (nameUpper.includes("BRI")) {
    primaryColor = "#00529c";
    headerTitle = "BANK BRI";
    cardName = "Kartu Kredit BRI Touch";
  } else if (nameUpper.includes("BNI")) {
    primaryColor = "#f15a24";
    headerTitle = "BANK BNI";
    cardName = "Kartu Kredit BNI Titanium";
  } else if (nameUpper.includes("UOB")) {
    primaryColor = "#002b66";
    headerTitle = "BANK UOB";
    cardName = "Kartu Kredit UOB Preferred Platinum";
  } else if (nameUpper.includes("CIMB")) {
    primaryColor = "#7f0000";
    headerTitle = "CIMB NIAGA";
    cardName = "Kartu Kredit CIMB Niaga Wave n Go";
  } else {
    primaryColor = "#005baa";
    headerTitle = "BANK BCA";
    cardName = "Kartu Kredit BCA Everyday Card";
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const subject = `[Notifikasi Transaksi] ${headerTitle} - Rp 5.000.000 di Shopee`;
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notifikasi Transaksi ${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 24px 28px; text-align: left;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 1px; font-family: monospace;">${headerTitle}</div>
                    <div style="color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">NOTIFIKASI TRANSAKSI KARTU KREDIT</div>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; padding: 5px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.3);">
                      RESMI & TERVERIFIKASI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0; font-weight: 500;">
                Yth. Nasabah <strong>${headerTitle}</strong>,<br>
                Rincian transaksi kartu kredit Anda berhasil dicatat dengan rincian berikut:
              </p>

              <!-- Transaction Summary Box -->
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 20px 0;">
                <tr>
                  <td style="padding-bottom: 14px; border-bottom: 1px dashed #cbd5e1;">
                    <div style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">TOTAL NOMINAL TRANSAKSI</div>
                    <div style="color: #0f172a; font-size: 28px; font-weight: 900; margin-top: 4px; font-family: 'Segoe UI', sans-serif;">Rp 5.000.000,-</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 14px;">
                    <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Merchant / Merchant Name:</td>
                        <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0f172a;">Shopee Indonesia</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Metode Pembayaran:</td>
                        <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0f172a;">${cardName} (•••• 8821)</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Waktu Transaksi:</td>
                        <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #0f172a;">${dateStr}, ${timeStr} WIB</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Status Otorisasi:</td>
                        <td style="padding: 5px 0; font-weight: 800; text-align: right; color: #16a34a;">BERHASIL / APPROVED</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Alert Warning & Cancel Transaction Button -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 5px solid #ef4444; padding: 18px; border-radius: 12px; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 13px; margin: 0 0 14px 0; font-weight: 700; line-height: 1.5;">
                  ⚠️ Apakah Anda tidak mengenali transaksi ini?
                  <span style="font-weight: 500; display: block; margin-top: 4px; color: #b91c1c;">
                    Jika merasa tidak melakukan transaksi sebesar Rp 5.000.000 di Shopee, segera batalkan transaksi ini untuk mengamankan limit kartu kredit Anda.
                  </span>
                </p>
                <div style="text-align: center; margin-top: 16px;">
                  <a href="https://shopee.co.id" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 10px; box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35); text-transform: uppercase; letter-spacing: 0.8px; border: 1px solid #b91c1c;">
                    Batalkan Transaksi
                  </a>
                </div>
              </div>

              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
                Pesan ini dikirimkan secara otomatis oleh Layanan Pengaman Transaksi ${headerTitle}.<br>
                Harap jangan membalas e-mail ini secara langsung.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
};

export const AiCopilotWidget: React.FC<AiCopilotWidgetProps> = React.memo(({
  isAiOpen,
  setIsAiOpen,
  setActiveTab,
  addLog,
  templates,
  setTemplates
}) => {
  const [aiHistory, setAiHistory] = useState<Array<{ 
    role: "user" | "model"; 
    content: string; 
    template?: any;
    image?: { data: string; mimeType: string; name: string };
  }>>(() => {
    const defaultGreeting = "Hallo...Saya JARVIS,\nServer ready silahkan berikan perintah..!!";
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("jarvis_ai_history_v3");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Enforce brief sapaan on mount: if the cached sapaan is too long or from old versions, replace it
            if (parsed[0] && parsed[0].role === "model") {
              const content = parsed[0].content || "";
              if (content.length > 100 || content.includes("bantuan") || !content.includes("Server ready")) {
                parsed[0].content = defaultGreeting;
              }
            }
            return parsed;
          }
        }
      } catch (e) {
        console.error("Gagal membaca riwayat chat J.A.R.V.I.S:", e);
      }
    }
    return [
      {
        role: "model",
        content: defaultGreeting
      }
    ];
  });

  // Save history to local backup storage whenever it changes with a debounce to prevent typing lag
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem("jarvis_ai_history_v3", JSON.stringify(aiHistory));
      } catch (e) {
        console.error("Gagal menyimpan riwayat chat J.A.R.V.I.S:", e);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [aiHistory]);

  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [selectedProvider] = useState<string>("auto");
  const [editModes, setEditModes] = useState<Record<number, "preview" | "html">>({});
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [thinkingText, setThinkingText] = useState("JARVIS sedang merangkai kata...");
  const [resetConfirm, setResetConfirm] = useState(false);

  // Auto-reset the warning state after 3 seconds of inactivity
  useEffect(() => {
    if (resetConfirm) {
      const timer = setTimeout(() => {
        setResetConfirm(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resetConfirm]);

  const aiChatEndRef = useRef<HTMLDivElement | null>(null);

  // Play sound on open
  useEffect(() => {
    if (isAiOpen) {
      playSciFiSound("ready");
    }
  }, [isAiOpen]);

  // Dynamically cycle thinking text during isAiLoading to represent JARVIS workflow step-by-step
  useEffect(() => {
    if (!isAiLoading) return;

    const lastMsg = aiHistory[aiHistory.length - 1];
    const textLower = (lastMsg?.content || "").toLowerCase();
    const hasImage = !!lastMsg?.image;

    let steps = [
      "Membaca pesan instruksi & konteks draf...",
      "Melacak pola keamanan bank & kecocokan data...",
      "Menyusun struktur tata letak HTML e-mail responsif...",
      "Menyisipkan tombol taktis, tautan, & placeholder...",
      "Finalisasi respons & validasi intonasi vokal..."
    ];

    if (hasImage) {
      steps = [
        "Memproses gambar lampiran & ekstraksi visual...",
        "Melacak pola keamanan bank & kecocokan data...",
        "Menyusun struktur tata letak HTML e-mail responsif...",
        "Menyisipkan tombol taktis, tautan, & placeholder...",
        "Finalisasi respons & validasi intonasi vokal..."
      ];
    } else if (textLower.includes("promosi") || textLower.includes("diskon") || textLower.includes("marketing") || textLower.includes("pemasaran")) {
      steps = [
        "Menganalisis segmentasi nasabah & gaya marketing...",
        "Menghitung kalkulasi diskon & penawaran promosi...",
        "Menyusun struktur tata letak HTML email promosi...",
        "Menambahkan tombol CTA (Call-to-Action) interaktif...",
        "Menyelaraskan intonasi komunikasi promosi..."
      ];
    } else if (textLower.includes("optimasi") || textLower.includes("poles") || textLower.includes("perbaiki") || textLower.includes("sunting")) {
      steps = [
        "Menganalisis draf email yang ingin dioptimasi...",
        "Memperbaiki kesalahan tata bahasa & penyusunan kalimat...",
        "Meningkatkan kompatibilitas HTML & gaya visual...",
        "Mengoptimalkan performa tombol & tautan penting...",
        "Mematangkan intonasi vokal profesional..."
      ];
    } else if (textLower.includes("analis") || textLower.includes("cek") || textLower.includes("kualitas") || textLower.includes("score")) {
      steps = [
        "Mengevaluasi keseluruhan konten draf email...",
        "Menguji kepatuhan keamanan perbankan (Spam/Phishing)...",
        "Menilai tingkat keterbacaan & estetika visual...",
        "Mengkalkulasi skor performa & saran perbaikan...",
        "Mempersiapkan laporan audit JARVIS..."
      ];
    } else if (textLower.includes("terjemah") || textLower.includes("translate") || textLower.includes("inggris") || textLower.includes("english")) {
      steps = [
        "Mengidentifikasi bahasa sumber & bahasa tujuan...",
        "Menerjemahkan kosakata ke padanan terminologi perbankan...",
        "Menyesuaikan tata bahasa agar terdengar alami...",
        "Mengintegrasikan kembali teks ke struktur template HTML...",
        "Menyempurnakan intonasi pelafalan dwi-bahasa..."
      ];
    }

    let currentIdx = 0;
    setThinkingText(steps[0]);

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < steps.length) {
        setThinkingText(steps[currentIdx]);
      } else {
        setThinkingText("Sedang merangkai kata terakhir...");
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isAiLoading, aiHistory]);



  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addLog("error", "Format file tidak didukung. Harap pilih gambar/foto.");
      return;
    }

    addLog("info", "Sedang mengompresi gambar untuk performa optimal...");
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Set maximum dimension
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as optimized JPEG
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          const commaIdx = optimizedDataUrl.indexOf(",");
          if (commaIdx !== -1) {
            const base64Data = optimizedDataUrl.substring(commaIdx + 1);
            setSelectedImage({
              data: base64Data,
              mimeType: "image/jpeg",
              name: file.name.replace(/\.[^/.]+$/, "") + ".jpg"
            });
            addLog("success", `Gambar "${file.name}" berhasil dikompresi & dimuat!`);
            playSciFiSound("success");
          } else {
            addLog("error", "Gagal mengompresi data gambar.");
          }
        } else {
          // Fallback if canvas context is not supported
          const resultStr = reader.result as string;
          const commaIdx = resultStr.indexOf(",");
          if (commaIdx !== -1) {
            const base64Data = resultStr.substring(commaIdx + 1);
            setSelectedImage({
              data: base64Data,
              mimeType: file.type,
              name: file.name
            });
            addLog("success", `Gambar "${file.name}" berhasil dimuat.`);
          }
        }
      };
      img.onerror = () => {
        addLog("error", "Gagal memproses gambar.");
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      addLog("error", "Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [addLog]);

  // Auto scroll chat to bottom when history or state changes
  useEffect(() => {
    if (aiChatEndRef.current) {
      aiChatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiHistory, isAiOpen, isAiLoading]);

  const handleSendAiMessage = useCallback(async (messageText: string) => {
    let finalMsg = messageText.trim();
    if (!finalMsg && selectedImage) {
      finalMsg = "Buatkan draf email yang serupa atau berdasarkan gambar yang saya kirim ini.";
    }
    if (!finalMsg) return;

    const textLower = finalMsg.toLowerCase();
    
    // Auto-Draft trigger when user mentions bank name in prompt
    let currentThinking = "JARVIS sedang merangkai kata...";
    
    if (textLower.includes("bukti") || textLower.includes("transaksi") || textLower.includes("resi") || textLower.includes("pembayaran") || textLower.includes("alert") || textLower.includes("pemakaian") || textLower.includes("kartu") || textLower.includes("shopee") || textLower.includes("fraud") || selectedImage) {
      currentThinking = "JARVIS sedang memproses gambar & merancang email...";
    } else if (textLower.includes("promosi") || textLower.includes("diskon") || textLower.includes("marketing") || textLower.includes("pemasaran") || textLower.includes("onboarding") || textLower.includes("selamat datang")) {
      currentThinking = "JARVIS sedang merancang email promosi...";
    } else if (textLower.includes("optimasi") || textLower.includes("poles") || textLower.includes("perbaiki") || textLower.includes("rapikan") || textLower.includes("sunting")) {
      currentThinking = "JARVIS sedang mengoptimalkan draf email...";
    } else if (textLower.includes("analis") || textLower.includes("cek") || textLower.includes("kualitas") || textLower.includes("score")) {
      currentThinking = "JARVIS sedang menganalisis kualitas email...";
    } else if (textLower.includes("terjemah") || textLower.includes("translate") || textLower.includes("inggris") || textLower.includes("english")) {
      currentThinking = "JARVIS sedang menerjemahkan draf email...";
    } else if (textLower.includes("balas") || textLower.includes("reply") || textLower.includes("jawaban")) {
      currentThinking = "JARVIS sedang menyusun balasan email...";
    }
    
    setThinkingText(currentThinking);
    playSciFiSound("thinking");

    const imageToSend = selectedImage ? { ...selectedImage } : undefined;
    const newUserMessage = { 
      role: "user" as const, 
      content: finalMsg,
      image: imageToSend
    };
    
    setAiHistory((prev) => [...prev, newUserMessage]);
    setAiInput("");
    setSelectedImage(null);
    setIsAiLoading(true);
    setAiError(null);
 
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalMsg,
          history: aiHistory.map(h => {
            let content = h.content || "";
            if (h.role === "model" && h.template && (h.template.html || h.template.subject)) {
              content += `\n\n[DRAF TEMPLATE HTML YANG DIBUAT SEBELUMNYA]:\nSubjek: ${h.template.subject || ""}\nHTML:\n${h.template.html || ""}`;
            }
            return { role: h.role, content };
          }),
          image: imageToSend ? { data: imageToSend.data, mimeType: imageToSend.mimeType } : undefined,
          provider: selectedProvider
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghubungi AI.");
      }

      const data = await response.json();
      const nextModelMessage = {
        role: "model" as const,
        content: data.message || "Berikut hasil draf email yang berhasil saya buat:",
        template: data.template || null,
        providerUsed: data.providerUsed,
        modelUsed: data.modelUsed,
        latencyMs: data.latencyMs
      };

      setAiHistory((prev) => {
        const updated = [...prev, nextModelMessage];
        setTimeout(() => {
          playSciFiSound("success");
        }, 150);
        return updated;
      });

    } catch (err: any) {
      console.log("[AI Client] Request handled.", err?.message || err);
      setAiError(err.message || "Koneksi AI terputus atau API Key belum diset.");
      setAiHistory((prev) => [...prev, {
        role: "model" as const,
        content: `Maaf, saya mengalami kendala: ${err.message || "Gagal menghubungi AI. Pastikan Anda telah mengonfigurasi API Key di Settings."}`
      }]);
    } finally {
      setIsAiLoading(false);
    }
  }, [aiHistory, selectedImage, selectedProvider]);

  const applyAiTemplateToForm = useCallback((tpl: { subject: string; html: string }) => {
    window.dispatchEvent(new CustomEvent("apply-template", { detail: { subject: tpl.subject, html: tpl.html } }));
    setActiveTab("send");
    setIsAiOpen(false);
    playSciFiSound("success");

    // Trigger visual notification
    window.dispatchEvent(new CustomEvent("banking-notif", {
      detail: {
        id: String(Date.now()),
        title: "AI COPILOT",
        message: "Draf email dari AI berhasil diterapkan ke form pengiriman!",
        timestamp: new Date().toLocaleTimeString(),
        recipient: "Form Pengiriman",
        ip: "Local"
      }
    }));
  }, [setActiveTab, setIsAiOpen]);

  const saveAiTemplateToCollection = useCallback((tpl: { subject: string; html: string; category?: string }) => {
    const newTemplate: EmailTemplate = {
      id: "tpl_" + Date.now(),
      name: "AI: " + (tpl.subject.substring(0, 20) || "Draf Tanpa Judul"),
      category: (tpl.category as any) || "General",
      subject: tpl.subject,
      message: tpl.html,
      createdAt: Date.now()
    };
    
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem("email_templates", JSON.stringify(updated));
    addLog("success", `Template AI "${newTemplate.name}" disimpan ke koleksi.`);
    playSciFiSound("success");
    
    // Trigger visual notification
    window.dispatchEvent(new CustomEvent("banking-notif", {
      detail: {
        id: String(Date.now()),
        title: "AI TEMPLATE",
        message: `Template "${newTemplate.name}" berhasil disimpan ke koleksi!`,
        timestamp: new Date().toLocaleTimeString(),
        recipient: "Template Manager",
        ip: "Local"
      }
    }));
  }, [templates, setTemplates, addLog]);

  const handleTemplateSubjectChange = useCallback((idx: number, newSubject: string) => {
    setAiHistory(prev => {
      const copy = [...prev];
      if (copy[idx]?.template) {
        copy[idx].template = { ...copy[idx].template, subject: newSubject };
      }
      return copy;
    });
  }, []);

  const handleTemplateHtmlChange = useCallback((idx: number, newHtml: string) => {
    setAiHistory(prev => {
      const copy = [...prev];
      if (copy[idx]?.template) {
        copy[idx].template = { ...copy[idx].template, html: newHtml };
      }
      return copy;
    });
  }, []);

  return (
    <AnimatePresence>
      {isAiOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140]"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute inset-0 w-full h-full bg-[#F5F6F8] z-[150] flex flex-col overflow-hidden text-slate-800"
          >
            {/* --- HIGH PERFORMANCE SYSTEM BACKGROUND (GPU-OPTIMIZED) --- */}
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-cover bg-center bg-no-repeat opacity-[0.05]"
              style={{ backgroundImage: `url(${jarvisBg})` }}
            />
            <div 
              className="absolute inset-0 pointer-events-none overflow-hidden z-[1]"
              style={{
                background: `
                  radial-gradient(circle at 50% 10%, rgba(0, 175, 240, 0.04) 0%, transparent 80%),
                  linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)
                `,
              }}
            />

            {/* Header Banner */}
            <div className="p-4 border-b border-slate-200/80 bg-white/75 backdrop-blur-md flex justify-between items-center shrink-0 relative z-10 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                {/* High-tech Icon container */}
                <div className="w-8 h-8 bg-slate-950 border border-jago/80 text-jago rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,175,240,0.25)] shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#00aff0_1px,transparent_1px)] [background-size:6px_6px] opacity-25" />
                  <div className="flex items-center justify-center animate-[spin_8s_linear_infinite]">
                    <Sparkles className="w-4 h-4 text-jago drop-shadow-[0_0_4px_#00aff0]" />
                  </div>
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-jago shadow-[0_0_6px_#00aff0]" />
                </div>
                
                {/* Cool Glowing "JARVIS" Text */}
                <div className="flex flex-col items-start leading-none">
                  <span 
                    className="font-mono font-black text-slate-900 tracking-[0.22em] text-sm uppercase transition-all duration-300 drop-shadow-[0_0_6px_rgba(0,175,240,0.15)]"
                    style={{ textShadow: "0 0 10px rgba(0, 175, 240, 0.45)" }}
                  >
                    JARVIS
                  </span>
                  <span className="text-[7px] font-black tracking-[0.3em] text-jago/60 uppercase transition-colors duration-300 mt-0.5 whitespace-nowrap">
                    SYSTEM CO-PILOT
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {aiHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!resetConfirm) {
                        setResetConfirm(true);
                        playSciFiSound("click");
                      } else {
                        const cleared = [
                          {
                            role: "model" as const,
                            content: "Hallo...Saya JARVIS,\nServer ready silahkan berikan perintah..!!"
                          }
                        ];
                        setAiHistory(cleared);
                        try {
                          localStorage.setItem("jarvis_ai_history_v3", JSON.stringify(cleared));
                        } catch (e) {
                          console.error(e);
                        }
                        setResetConfirm(false);
                        addLog("warning", "Riwayat percakapan JARVIS dibersihkan.");
                        playSciFiSound("click");
                      }
                    }}
                    className={hn(
                      "px-2 py-1 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0",
                      resetConfirm 
                        ? "border-rose-400 bg-rose-500 text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                        : "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600"
                    )}
                    title={resetConfirm ? "Klik sekali lagi untuk konfirmasi hapus" : "Reset obrolan"}
                  >
                    {resetConfirm ? "YAKIN HAPUS?" : "RESET CHAT"}
                  </button>
                )}
                <button
                  onClick={() => setIsAiOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Provider Indicator Bar - Compact Single Line */}
            <div className="px-3 py-1 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 text-[10px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 min-w-0">
                <Cpu className="w-3.5 h-3.5 text-[#00aff0] shrink-0 animate-pulse" />
                <span className="font-bold text-slate-800 shrink-0">JARVIS AI:</span>
                <span className="text-slate-500 truncate">Routing Otomatis Cerdas</span>
              </div>
              <span className="text-[9px] font-bold text-[#00aff0] bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md font-mono shrink-0 whitespace-nowrap">
                ⚡ 100% Otomatis
              </span>
            </div>

            {/* Chat History & Stream Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent relative z-10">
              {aiHistory.map((msg, idx) => {
                const editMode = editModes[idx] || "preview";
                const setEditMode = (mode: "preview" | "html") => {
                  setEditModes(prev => ({ ...prev, [idx]: mode }));
                };
                
                return (
                  <ChatMessageItem
                    key={idx}
                    msg={msg}
                    idx={idx}
                    editMode={editMode}
                    setEditMode={setEditMode}
                    isAiLoading={isAiLoading}
                    handleSendAiMessage={handleSendAiMessage}
                    applyAiTemplateToForm={() => applyAiTemplateToForm(msg.template)}
                    saveAiTemplateToCollection={() => saveAiTemplateToCollection(msg.template)}
                    onTemplateSubjectChange={(newSubject) => handleTemplateSubjectChange(idx, newSubject)}
                    onTemplateHtmlChange={(newHtml) => handleTemplateHtmlChange(idx, newHtml)}
                  />
                );
              })}

              {isAiLoading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none mr-auto shadow-sm p-3.5 max-w-[85%] flex flex-col gap-1.5 animate-fade-in relative z-10 min-w-0">
                  <div className="flex items-center justify-between mb-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                    <span>JARVIS</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex gap-1 items-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00aff0] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-sans tracking-wide animate-pulse whitespace-nowrap truncate max-w-[160px] xs:max-w-[220px] sm:max-w-[340px]" title={thinkingText}>
                      {thinkingText}
                    </span>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div ref={aiChatEndRef} />
            </div>

            {/* Prompt Quick Suggestion Strip */}
            <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none shrink-0 relative z-10">
              {[
                { label: "Transaksi BCA", bank: "BCA", prompt: "Buatkan draf email transaksi kartu kredit BCA sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." },
                { label: "Transaksi Mandiri", bank: "Mandiri", prompt: "Buatkan draf email transaksi kartu kredit Mandiri sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." },
                { label: "Transaksi BRI", bank: "BRI", prompt: "Buatkan draf email transaksi kartu kredit BRI sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." },
                { label: "Transaksi BNI", bank: "BNI", prompt: "Buatkan draf email transaksi kartu kredit BNI sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." },
                { label: "Transaksi UOB", bank: "UOB", prompt: "Buatkan draf email transaksi kartu kredit UOB sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." },
                { label: "Transaksi CIMB", bank: "CIMB Niaga", prompt: "Buatkan draf email transaksi kartu kredit CIMB Niaga sebesar Rp 5.000.000 di merchant Shopee lengkap dengan tombol Batalkan Transaksi." }
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendAiMessage(sug.prompt)}
                  disabled={isAiLoading}
                  className="copilot-chip shrink-0 cursor-pointer active:scale-95 text-[11px] font-semibold tracking-tight whitespace-nowrap"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            {/* Footer Send Prompt Panel */}
            <div className="px-3.5 sm:px-4 py-3 pb-4 sm:pb-3 border-t border-slate-200 bg-slate-50 backdrop-blur-md shrink-0 space-y-2 relative z-10">
              {/* Image Preview if selected */}
              {selectedImage && (
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                      <img 
                        src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                        alt="Selected" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">
                        {selectedImage.name}
                      </span>
                      <span className="text-[8px] font-extrabold text-[#00aff0] uppercase tracking-wider">
                        Foto Siap Dikirim
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      playSciFiSound("click");
                    }}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiMessage(aiInput);
                }}
                className="flex items-center gap-2 w-full min-w-0"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="ai-image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isAiLoading}
                />
                <button
                  type="button"
                  disabled={isAiLoading}
                  onClick={() => {
                    playSciFiSound("click");
                    document.getElementById("ai-image-upload")?.click();
                  }}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    selectedImage 
                      ? "bg-sky-100 text-[#008cc3] border-sky-300" 
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title="Upload Foto/Gambar"
                >
                  <Image className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  disabled={isAiLoading}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ketik perintah atau pertanyaan..."
                  className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#00aff0] text-slate-800 placeholder:text-slate-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || (!aiInput.trim() && !selectedImage)}
                  className="p-2.5 bg-[#00aff0] hover:bg-[#009bc3] text-white rounded-xl shadow-md border border-[#008cc3] transition-all disabled:opacity-40 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Kirim Pesan"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
