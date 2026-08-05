import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ExternalLink } from "lucide-react";
import { EmailTemplate } from "../../types";
import { getHtmlLinks } from "../../lib/utils";

interface TemplatePreviewModalProps {
  previewTemplate: EmailTemplate | null;
  setPreviewTemplate: (template: EmailTemplate | null) => void;
  setActiveTab: (tab: "send" | "templates" | "terminal" | "accounts") => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  previewTemplate,
  setPreviewTemplate,
  setActiveTab,
}) => {
  return (
    <AnimatePresence>
      {previewTemplate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-2xl mx-auto rounded-[24px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800"
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    {previewTemplate.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold truncate">
                    {previewTemplate.subject}
                  </p>
                </div>
                <button 
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              {/* Dynamic Flexible Link Detector */}
              {(() => {
                const detectedLinks = getHtmlLinks(previewTemplate.message);
                if (detectedLinks.length === 0) return null;
                return (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1">
                    <div className="text-[9px] font-black text-[#00aff0] uppercase tracking-wider flex items-center gap-1">
                      <span>🔗 Link Terdeteksi (Buka di Tab Baru / Bebas Hambatan):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[64px] overflow-y-auto pr-1 py-0.5">
                      {detectedLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[10px] text-[#008cc3] font-black hover:bg-sky-100 hover:text-[#00aff0] transition-colors shrink-0 max-w-full cursor-pointer"
                        >
                          <span className="truncate max-w-[150px]">{link.text}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-hidden p-4 bg-slate-100 flex flex-col min-h-[380px]">
              <iframe
                title="Real Template Preview"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        html, body {
                          margin: 0;
                          padding: 0;
                          width: 100%;
                          min-height: 100%;
                          background-color: #ffffff;
                          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                          color: #333333;
                          overflow-x: hidden !important;
                          position: relative;
                        }
                        img {
                          max-width: 100%;
                          height: auto;
                        }
                      </style>
                    </head>
                    <body>
                      ${previewTemplate.message}
                      <script>
                        window.addEventListener('DOMContentLoaded', function() {
                          var anchors = document.getElementsByTagName('a');
                          for (var i = 0; i < anchors.length; i++) {
                            anchors[i].setAttribute('target', '_blank');
                            anchors[i].setAttribute('rel', 'noopener noreferrer');
                          }

                          var wrapper = document.createElement('div');
                          wrapper.id = 'email-wrapper';
                          wrapper.style.width = '600px';
                          wrapper.style.position = 'absolute';
                          wrapper.style.left = '50%';
                          wrapper.style.top = '0';
                          wrapper.style.transformOrigin = 'top center';
                          wrapper.style.boxSizing = 'border-box';
                          
                          while (document.body.firstChild) {
                            wrapper.appendChild(document.body.firstChild);
                          }
                          document.body.appendChild(wrapper);
                          
                          function adjustScale() {
                            var viewportWidth = window.innerWidth;
                            var targetWidth = viewportWidth - 16;
                            if (targetWidth < 280) targetWidth = viewportWidth;
                            var scale = targetWidth / 600;
                              
                            if (scale < 1) {
                              wrapper.style.transform = 'translateX(-50%) scale(' + scale + ')';
                              document.body.style.height = (wrapper.offsetHeight * scale + 24) + 'px';
                            } else {
                              wrapper.style.transform = 'translateX(-50%)';
                              document.body.style.height = (wrapper.offsetHeight + 24) + 'px';
                            }
                          }
                          
                          window.addEventListener('resize', adjustScale);
                          window.addEventListener('load', adjustScale);
                          
                          if (typeof ResizeObserver !== 'undefined') {
                            var ro = new ResizeObserver(adjustScale);
                            ro.observe(wrapper);
                          }
                          
                          setTimeout(adjustScale, 50);
                          setTimeout(adjustScale, 200);
                          setTimeout(adjustScale, 500);
                        });
                      </script>
                    </body>
                  </html>
                `}
                className="w-full flex-1 border-0 rounded-2xl bg-white shadow-inner"
                sandbox="allow-popups allow-scripts"
              />
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 py-3 text-[11px] font-black text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all uppercase tracking-wider"
              >
                TUTUP
              </button>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("use-template", { detail: previewTemplate }));
                  setActiveTab("send");
                  setPreviewTemplate(null);
                }}
                className="flex-1 py-3 bg-[#00aff0] hover:bg-[#009bc3] text-white text-[11px] font-black rounded-xl border border-[#008cc3] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#00aff0]/20 uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5" /> GUNAKAN SEKARANG
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
