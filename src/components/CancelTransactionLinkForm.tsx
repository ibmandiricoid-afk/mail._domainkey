import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Globe, Check, Save } from "lucide-react";
import { hn } from "../lib/utils";

interface CancelTransactionLinkFormProps {
  html: string;
  onUpdateHtml: (newHtml: string) => void;
  onSave?: (updatedHtml: string) => void;
  className?: string;
}

/**
 * Helper to extract cancellation link & text from HTML
 */
export const extractCancelLinkData = (html: string) => {
  if (typeof window === "undefined" || !html) return { text: "Batalkan Transaksi", href: "https://shopee.co.id", found: false };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a"));

    // Search for anchor with cancellation keywords
    const match = anchors.find((a) => {
      const txt = (a.textContent || "").toLowerCase();
      const href = (a.getAttribute("href") || "").toLowerCase();
      return (
        /batal|cancel|pembatalan|laporkan|fraud|tolak/i.test(txt) ||
        /batal|cancel/i.test(href)
      );
    }) || anchors[0];

    if (match) {
      return {
        text: match.textContent?.trim() || "Batalkan Transaksi",
        href: match.getAttribute("href") || "https://shopee.co.id",
        found: true
      };
    }
  } catch (e) {
    console.error("Error parsing cancel link:", e);
  }
  return { text: "Batalkan Transaksi", href: "https://shopee.co.id", found: false };
};

/**
 * Helper to update or insert cancellation link in HTML
 */
export const applyCancelLinkToHtml = (
  html: string,
  newText: string,
  newHref: string,
  buttonBgColor = "#dc2626"
): string => {
  if (!html) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px;">
  <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 5px solid #ef4444; padding: 18px; border-radius: 12px; margin: 20px 0;">
    <p style="color: #991b1b; font-size: 13px; margin: 0 0 14px 0; font-weight: 700;">
      ⚠️ Apakah Anda tidak mengenali transaksi ini?
    </p>
    <div style="text-align: center;">
      <a href="${newHref}" target="_blank" style="display: inline-block; background-color: ${buttonBgColor}; color: #ffffff; padding: 14px 32px; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 10px; border: 1px solid ${buttonBgColor}; shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
        ${newText}
      </a>
    </div>
  </div>
</body>
</html>`;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a"));

    // Search for existing cancellation anchor
    const match = anchors.find((a) => {
      const txt = (a.textContent || "").toLowerCase();
      const href = (a.getAttribute("href") || "").toLowerCase();
      return (
        /batal|cancel|pembatalan|laporkan|fraud|tolak/i.test(txt) ||
        /batal|cancel/i.test(href)
      );
    });

    const styleAttr = `display: inline-block; background-color: ${buttonBgColor}; color: #ffffff; padding: 14px 32px; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.8px; border: 1px solid ${buttonBgColor}; box-shadow: 0 6px 18px rgba(220, 38, 38, 0.35);`;

    if (match) {
      match.textContent = newText;
      match.setAttribute("href", newHref);
      match.setAttribute("style", styleAttr);

      if (html.toLowerCase().includes("<html")) {
        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      }
      return doc.body.innerHTML;
    } else {
      // Create new cancellation box and append
      const cancelBox = doc.createElement("div");
      cancelBox.setAttribute(
        "style",
        "background-color: #fef2f2; border: 1px solid #fecaca; border-left: 5px solid #ef4444; padding: 18px; border-radius: 12px; margin: 20px 0;"
      );
      cancelBox.innerHTML = `
        <p style="color: #991b1b; font-size: 13px; margin: 0 0 14px 0; font-weight: 700; line-height: 1.5;">
          ⚠️ Apakah Anda tidak mengenali transaksi ini?
          <span style="font-weight: 500; display: block; margin-top: 4px; color: #b91c1c;">
            Jika merasa tidak melakukan transaksi ini, segera batalkan transaksi ini untuk mengamankan limit Anda.
          </span>
        </p>
        <div style="text-align: center; margin-top: 14px;">
          <a href="${newHref}" target="_blank" style="${styleAttr}">
            ${newText}
          </a>
        </div>
      `;

      doc.body.appendChild(cancelBox);

      if (html.toLowerCase().includes("<html")) {
        return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
      }
      return doc.body.innerHTML;
    }
  } catch (e) {
    console.error("Error updating cancel link:", e);
  }

  return html;
};

export const CancelTransactionLinkForm: React.FC<CancelTransactionLinkFormProps> = React.memo(({
  html,
  onUpdateHtml,
  onSave,
  className
}) => {
  const extractedData = useMemo(() => extractCancelLinkData(html), [html]);

  const [buttonText, setButtonText] = useState(extractedData.text);
  const [targetUrl, setTargetUrl] = useState(extractedData.href);
  const [justSaved, setJustSaved] = useState(false);

  // Sync internal state if HTML external source changes completely
  useEffect(() => {
    setButtonText(extractedData.text);
    setTargetUrl(extractedData.href);
  }, [extractedData.text, extractedData.href]);

  const handleSave = useCallback(() => {
    const updated = applyCancelLinkToHtml(html, buttonText, targetUrl);
    onUpdateHtml(updated);
    if (onSave) onSave(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [html, buttonText, targetUrl, onUpdateHtml, onSave]);

  return (
    <div
      className={hn(
        "bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3 space-y-3 shadow-xs transition-all",
        className
      )}
    >
      {/* Field 1: TEKS TOMBOL PEMBATALAN */}
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
          TEKS TOMBOL PEMBATALAN
        </label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="Batalkan Transaksi"
          className="w-full px-3 py-2 bg-white border border-rose-200/90 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 shadow-xs transition-all"
        />
      </div>

      {/* Field 2: URL / LINK TUJUAN PEMBATALAN */}
      <div>
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
          URL / LINK TUJUAN PEMBATALAN
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-rose-500">
            <Globe className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://wa.me/62812345"
            className="w-full pl-8 pr-3 py-2 bg-white border border-rose-200/90 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Tombol Simpan */}
      <div>
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider cursor-pointer"
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Tersimpan
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Simpan
            </>
          )}
        </button>
      </div>
    </div>
  );
});
CancelTransactionLinkForm.displayName = "CancelTransactionLinkForm";
