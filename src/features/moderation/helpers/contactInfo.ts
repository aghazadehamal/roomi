const PHONE_RE =
  /(?:\+994|994|0)(?:[\s.\-/]*\d){9,12}\b|(?:\+994|994|0)\d{2}[\s.\-/]?\d{3}[\s.\-/]?\d{2}[\s.\-/]?\d{2}/i;

const WHATSAPP_RE = /\b(?:whatsapp|wa\.me|vatsap|vatsapp|ватсап)\b/i;

const INSTAGRAM_RE =
  /\b(?:instagram\.com|instagr\.am|instagram|insta\s*gram|инстаграм)\b|(?:^|\s)@[\w.]{3,30}\b/i;

export const CONTACT_INFO_ERROR =
  "Telefon, WhatsApp və Instagram yazmaq olmaz. Əlaqə yalnız mesajla.";

export function containsContactInfo(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }
  return (
    PHONE_RE.test(normalized) ||
    WHATSAPP_RE.test(normalized) ||
    INSTAGRAM_RE.test(normalized)
  );
}
