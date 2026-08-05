/**
 * Shared utility functions
 */

export function hn(...args: any[]) {
  return args.filter(Boolean).join(" ").trim();
}

export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return STRICT_EMAIL_REGEX.test(trimmed);
}

export const DOMAIN_TYPOS: Record<string, string> = {
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmill.com": "gmail.com",
  "gmall.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yaho.co.id": "yahoo.co.id",
  "outlok.com": "outlook.com",
  "hotmial.com": "hotmail.com"
};

export function getEmailTypoFix(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return null;
  const domain = parts[1];
  if (DOMAIN_TYPOS[domain]) {
    return `${parts[0]}@${DOMAIN_TYPOS[domain]}`;
  }
  return null;
}

export function triggerVibration(ms = 12) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (_) {
      // Ignore vibration blocker errors
    }
  }
}

export const getHtmlLinks = (html: string) => {
  if (typeof window === "undefined" || !html) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = doc.querySelectorAll("a");
    const result: Array<{ text: string; href: string }> = [];
    anchors.forEach((a, index) => {
      const href = a.getAttribute("href") || "";
      if (href && href !== "#") {
        result.push({
          text: a.textContent || a.innerText || `Link ${index + 1}`,
          href
        });
      }
    });
    return result;
  } catch (_) {
    return [];
  }
};

export function getActiveSignature(): string {
  if (typeof window === "undefined") return "";
  try {
    const saved = localStorage.getItem("relay_smtp_config") || localStorage.getItem("smtp_account");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.enableSignature !== false && parsed.emailSignature && typeof parsed.emailSignature === "string" && parsed.emailSignature.trim()) {
        return parsed.emailSignature.trim();
      }
    }
  } catch (e) {
    console.error("Error reading active signature from localStorage:", e);
  }
  return "";
}

export function appendSignatureToHtml(html: string): string {
  if (!html) return html;
  const sig = getActiveSignature();
  if (!sig) return html;

  // Check if signature or signature container is already present in html
  if (html.includes("email-global-signature") || html.includes(sig)) {
    return html;
  }

  const sigWrapper = `\n<div class="email-global-signature" style="margin-top:24px; border-top:1px dashed #cbd5e1; padding-top:16px;">\n${sig}\n</div>`;

  if (html.toLowerCase().includes("</body>")) {
    return html.replace(/<\/body>/i, `${sigWrapper}\n</body>`);
  }
  return html + sigWrapper;
}
