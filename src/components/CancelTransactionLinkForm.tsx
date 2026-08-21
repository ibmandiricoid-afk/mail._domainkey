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

export interface BankBrandPreset {
  id: string;
  name: string;
  color: string;
  keywords: string[];
}

export const BANK_BRAND_PRESETS: BankBrandPreset[] = [
  { id: "mandiri", name: "Bank Mandiri", color: "#003d79", keywords: ["mandiri"] },
  { id: "bca", name: "Bank BCA", color: "#005baa", keywords: ["bca"] },
  { id: "bri", name: "Bank BRI", color: "#00529c", keywords: ["bri"] },
  { id: "bni", name: "Bank BNI", color: "#f15a24", keywords: ["bni"] },
  { id: "cimb", name: "CIMB Niaga", color: "#7f0000", keywords: ["cimb", "niaga"] },
  { id: "permata", name: "Bank Permata", color: "#008343", keywords: ["permata"] },
  { id: "bsi", name: "Bank Syariah Indonesia", color: "#00a39e", keywords: ["bsi", "syariah indonesia"] },
  { id: "uob", name: "Bank UOB", color: "#002b66", keywords: ["uob"] },
  { id: "danamon", name: "Bank Danamon", color: "#e05206", keywords: ["danamon"] },
  { id: "ocbc", name: "Bank OCBC", color: "#eb1c24", keywords: ["ocbc"] },
  { id: "mega", name: "Bank Mega", color: "#f37021", keywords: ["mega"] },
  { id: "maybank", name: "Maybank", color: "#ffc800", keywords: ["maybank"] },
  { id: "btn", name: "Bank BTN", color: "#004b87", keywords: ["btn"] },
  { id: "hsbc", name: "HSBC", color: "#db0011", keywords: ["hsbc"] },
  { id: "jenius", name: "Jenius / BTPN", color: "#00a8cc", keywords: ["jenius", "btpn"] },
];

/**
 * Helper to detect bank brand color from HTML content
 */
export const detectBankColor = (html: string): string => {
  if (!html) return "#003d79"; // Mandiri Navy Blue default
  const txt = html.toLowerCase();

  for (const preset of BANK_BRAND_PRESETS) {
    if (preset.keywords.some((kw) => txt.includes(kw))) {
      return preset.color;
    }
  }

  // Try extracting background color of existing cancellation button from HTML
  try {
    if (typeof window !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const anchors = Array.from(doc.querySelectorAll("a"));
      const cancelBtn = anchors.find(a => 
        /batal|cancel|pembatalan|laporkan|fraud|tolak/i.test(a.textContent || "") || 
        /batal|cancel/i.test(a.getAttribute("href") || "")
      );
      if (cancelBtn) {
        const style = cancelBtn.getAttribute("style") || "";
        const bgMatch = style.match(/background-color:\s*(#[a-f0-9]{3,8}|rgba?\([^)]+\))/i);
        if (bgMatch && bgMatch[1] && !bgMatch[1].includes("#ffffff") && !bgMatch[1].includes("#f8fafc") && !bgMatch[1].includes("#fef2f2")) {
          return bgMatch[1];
        }
      }
    }
  } catch (e) {}

  return "#003d79"; // Fallback to Bank Navy Blue
};

/**
 * Helper to update or insert cancellation link in HTML with matching bank color
 */
export const applyCancelLinkToHtml = (
  html: string,
  newText: string,
  newHref: string,
  buttonBgColor?: string
): string => {
  const bankColor = buttonBgColor || detectBankColor(html);

  if (!html) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 20px;">
  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid ${bankColor}; padding: 18px; border-radius: 12px; margin: 20px 0;">
    <p style="color: #1e293b; font-size: 13px; margin: 0 0 14px 0; font-weight: 700;">
      ⚠️ Apakah Anda tidak mengenali transaksi ini?
    </p>
    <div style="text-align: center;">
      <a href="${newHref}" target="_blank" style="display: inline-block; background-color: ${bankColor}; color: #ffffff; padding: 14px 32px; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 10px; border: 1px solid ${bankColor}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
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

    const styleAttr = `display: inline-block; background-color: ${bankColor}; color: #ffffff; padding: 14px 32px; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.8px; border: 1px solid ${bankColor}; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);`;

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
        `background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid ${bankColor}; padding: 18px; border-radius: 12px; margin: 20px 0;`
      );
      cancelBox.innerHTML = `
        <p style="color: #1e293b; font-size: 13px; margin: 0 0 14px 0; font-weight: 700; line-height: 1.5;">
          ⚠️ Apakah Anda tidak mengenali transaksi ini?
          <span style="font-weight: 500; display: block; margin-top: 4px; color: #475569;">
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
  const detectedColor = useMemo(() => detectBankColor(html), [html]);

  const [selectedColor, setSelectedColor] = useState(detectedColor);
  const [buttonText, setButtonText] = useState(extractedData.text);
  const [targetUrl, setTargetUrl] = useState(extractedData.href);
  const [justSaved, setJustSaved] = useState(false);

  // Sync internal state if HTML external source changes completely
  useEffect(() => {
    setButtonText(extractedData.text);
    setTargetUrl(extractedData.href);
    setSelectedColor(detectedColor);
  }, [extractedData.text, extractedData.href, detectedColor]);

  // Find active preset details
  const activePreset = useMemo(() => {
    return BANK_BRAND_PRESETS.find(p => p.color.toLowerCase() === selectedColor.toLowerCase()) || {
      name: "Custom Brand",
      color: selectedColor
    };
  }, [selectedColor]);

  const handleSelectBankPreset = (presetColor: string) => {
    setSelectedColor(presetColor);
    const updated = applyCancelLinkToHtml(html, buttonText, targetUrl, presetColor);
    onUpdateHtml(updated);
  };

  const handleSave = useCallback(() => {
    const updated = applyCancelLinkToHtml(html, buttonText, targetUrl, selectedColor);
    onUpdateHtml(updated);
    if (onSave) onSave(updated);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }, [html, buttonText, targetUrl, selectedColor, onUpdateHtml, onSave]);

  return (
    <div
      className={hn(
        "bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 shadow-xs transition-all",
        className
      )}
      style={{ borderLeft: `5px solid ${selectedColor}` }}
    >
      {/* Header: Active Bank Brand Color Indicator */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <div 
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-slate-300" 
            style={{ backgroundColor: selectedColor }} 
          />
          <span className="text-[9.5px] sm:text-[10px] font-black text-slate-800 uppercase tracking-wider truncate">
            Warna Tombol Bank: {activePreset.name}
          </span>
        </div>
        <span 
          className="text-[8.5px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border text-slate-600 bg-white shadow-2xs shrink-0"
          style={{ borderColor: selectedColor, color: selectedColor }}
        >
          {selectedColor.toUpperCase()}
        </span>
      </div>

      {/* Dynamic Bank Preset Selector Chips */}
      <div>
        <label className="text-[8.5px] sm:text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
          PILIH MEREK BANK (WARNA TOMBOL DINAMIS)
        </label>
        <div className="flex flex-wrap gap-1.5 py-1 max-w-full">
          {BANK_BRAND_PRESETS.map((preset) => {
            const isSelected = preset.color.toLowerCase() === selectedColor.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectBankPreset(preset.color)}
                className={hn(
                  "shrink-0 px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 ring-1 ring-slate-400"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                )}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: preset.color }} 
                />
                <span className="whitespace-nowrap">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Field 1: TEKS TOMBOL PEMBATALAN */}
      <div>
        <label className="text-[9.5px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
          TEKS TOMBOL PEMBATALAN
        </label>
        <input
          type="text"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="Batalkan Transaksi"
          className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 shadow-xs transition-all min-w-0"
        />
      </div>

      {/* Field 2: URL / LINK TUJUAN PEMBATALAN */}
      <div>
        <label className="text-[9.5px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
          URL / LINK TUJUAN PEMBATALAN
        </label>
        <div className="relative flex items-center min-w-0">
          <span className="absolute left-2.5 text-slate-500">
            <Globe className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://wa.me/62812345"
            className="w-full pl-8 pr-2.5 sm:pr-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-[11px] sm:text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 shadow-xs transition-all min-w-0"
          />
        </div>
      </div>

      {/* Tombol Simpan - Matching Selected Bank Brand Theme Color */}
      <div>
        <button
          type="button"
          onClick={handleSave}
          style={{ backgroundColor: selectedColor }}
          className="w-full py-2.5 hover:brightness-110 active:scale-[0.99] text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider cursor-pointer"
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Tersimpan & Terhubung ke Email
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Simpan Warna Bank & Link
            </>
          )}
        </button>
      </div>
    </div>
  );
});
CancelTransactionLinkForm.displayName = "CancelTransactionLinkForm";
