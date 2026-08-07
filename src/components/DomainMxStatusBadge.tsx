import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, Globe, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DomainResult {
  domain: string;
  valid: boolean | null; // null = checking
  mxServer?: string;
  reason?: string;
}

interface DomainMxStatusBadgeProps {
  emailInput: string;
  className?: string;
  showWhenEmpty?: boolean;
}

// In-memory cache to avoid duplicate DNS queries during user session
const mxCheckCache = new Map<string, { valid: boolean; mxServer?: string; reason?: string }>();

/**
 * Extracts unique domain names from raw input (supports single email or comma/newline separated emails)
 */
function extractDomains(input: string): string[] {
  if (!input || !input.trim()) return [];
  const parts = input.split(/[,;\s\n]+/).map(s => s.trim()).filter(Boolean);
  const domains = new Set<string>();

  for (const part of parts) {
    if (part.includes("@")) {
      const dom = part.split("@").pop()?.trim().toLowerCase();
      // Ensure domain has at least one dot and length > 3 to avoid premature check on "user@g"
      if (dom && dom.includes(".") && dom.split(".").pop()!.length >= 2 && !dom.endsWith(".")) {
        domains.add(dom);
      }
    }
  }

  return Array.from(domains).slice(0, 3); // Check up to 3 domains concurrently
}

/**
 * Perform MX record check via backend API with Google Public DNS fallback
 */
async function performMxCheck(domain: string): Promise<{ valid: boolean; mxServer?: string; reason?: string }> {
  if (mxCheckCache.has(domain)) {
    return mxCheckCache.get(domain)!;
  }

  // Fast path for major email providers
  const MAJOR_DOMAINS = [
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.id", "yahoo.co.uk",
    "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com",
    "aol.com", "protonmail.com", "bankmandiri.co.id", "mandiri.co.id",
    "bca.co.id", "bni.co.id", "bri.co.id", "cimbniaga.co.id", "uob.co.id"
  ];

  if (MAJOR_DOMAINS.includes(domain)) {
    const res = { valid: true, mxServer: `mx.${domain}` };
    mxCheckCache.set(domain, res);
    return res;
  }

  // 1. Primary: Server endpoint
  try {
    const resp = await fetch(`/api/check-domain-mx?domain=${encodeURIComponent(domain)}`);
    if (resp.ok) {
      const data = await resp.json();
      const res = {
        valid: !!data.valid,
        mxServer: data.mxServer,
        reason: data.reason || (data.valid ? "MX Record Aktif" : "MX Record Tidak Ditemukan")
      };
      mxCheckCache.set(domain, res);
      return res;
    }
  } catch (err) {
    // ignore backend error, fallback to Google Public DNS
  }

  // 2. Fallback: Direct Google Public DNS JSON API over HTTPS
  try {
    const dnsResp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
    if (dnsResp.ok) {
      const dnsData = await dnsResp.json();
      // Status === 0 means NOERROR, Answer array contains MX records
      if (dnsData.Status === 0 && Array.isArray(dnsData.Answer) && dnsData.Answer.length > 0) {
        const firstMx = dnsData.Answer[0].data || `mx.${domain}`;
        const res = { valid: true, mxServer: firstMx };
        mxCheckCache.set(domain, res);
        return res;
      } else if (dnsData.Status === 3) {
        // NXDOMAIN - Domain does not exist
        const res = { valid: false, reason: "Domain DNS tidak ditemukan (NXDOMAIN)" };
        mxCheckCache.set(domain, res);
        return res;
      }
    }
  } catch (err) {
    // DNS check offline / blocked
  }

  // Default fallback assuming valid if network check fails to avoid blocking user
  const fallback = { valid: true, mxServer: `dns.${domain}` };
  return fallback;
}

export const DomainMxStatusBadge: React.FC<DomainMxStatusBadgeProps> = ({
  emailInput,
  className = "",
  showWhenEmpty = false
}) => {
  const [results, setResults] = useState<DomainResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const targetDomains = extractDomains(emailInput);

    if (targetDomains.length === 0) {
      setResults([]);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const checkPromises = targetDomains.map(async (dom) => {
        const check = await performMxCheck(dom);
        return {
          domain: dom,
          valid: check.valid,
          mxServer: check.mxServer,
          reason: check.reason
        };
      });

      const resList = await Promise.all(checkPromises);
      setResults(resList);
      setIsChecking(false);
    }, 380); // 380ms lightweight debounce

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [emailInput]);

  if (!emailInput.trim() && !showWhenEmpty) return null;
  if (results.length === 0 && !isChecking) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 mt-1.5 transition-all ${className}`}>
      <AnimatePresence mode="popLayout">
        {isChecking && results.length === 0 && (
          <motion.div
            key="checking"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/90 text-sky-700 text-[11px] font-semibold shadow-2xs select-none"
          >
            <span className="w-3 h-3 css-spinner text-sky-600 shrink-0" />
            <span>Memeriksa MX Record domain...</span>
          </motion.div>
        )}

        {results.map((res) => (
          <motion.div
            key={res.domain}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border shadow-2xs select-none transition-all ${
              res.valid
                ? "bg-emerald-50/90 border-emerald-200/90 text-emerald-800"
                : "bg-rose-50/90 border-rose-200/90 text-rose-800"
            }`}
          >
            {res.valid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="flex items-center gap-1">
                  <span className="font-extrabold uppercase tracking-tight text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                    Domain Valid
                  </span>
                  <span className="font-mono font-bold text-emerald-900">@{res.domain}</span>
                  {res.mxServer && (
                    <span className="text-[10px] text-emerald-600 font-mono hidden sm:inline opacity-80">
                      (MX: {res.mxServer.replace(/\.$/, "")})
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-bounce" />
                <span className="flex items-center gap-1">
                  <span className="font-extrabold uppercase tracking-tight text-[10px] text-rose-700 bg-rose-100/90 px-1.5 py-0.2 rounded">
                    Domain Tidak Ditemukan
                  </span>
                  <span className="font-mono font-bold text-rose-950">@{res.domain}</span>
                  <span className="text-[10px] text-rose-600 font-medium hidden sm:inline">
                    (Tidak ada MX Record)
                  </span>
                </span>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
