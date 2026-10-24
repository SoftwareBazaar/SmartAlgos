/** Consumer / free-mail domains — blocked for institutional download gates. */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "tutanota.com",
  "tuta.io",
  "fastmail.com",
  "hey.com",
  "qq.com",
  "163.com",
  "126.com",
  "mail.ru",
  "inbox.com",
  "rocketmail.com",
]);

export function isValidEmailShape(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function getEmailDomain(email: string): string | null {
  const at = email.trim().toLowerCase().lastIndexOf("@");
  if (at < 0) return null;
  return email.trim().toLowerCase().slice(at + 1);
}

/** True for institutional / work domains (not free consumer inboxes). */
export function isWorkEmail(email: string): boolean {
  if (!isValidEmailShape(email)) return false;
  const domain = getEmailDomain(email);
  if (!domain || !domain.includes(".")) return false;
  if (FREE_EMAIL_DOMAINS.has(domain)) return false;
  // Block obvious disposable-style single-label free hosts already listed; allow company.co.ke etc.
  return true;
}

export const WORK_EMAIL_HINT =
  "Use your work email (e.g. you@bank.co.ke). Personal inboxes like Gmail or Yahoo are not accepted.";
