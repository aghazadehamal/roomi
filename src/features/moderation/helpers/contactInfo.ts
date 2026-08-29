import {
  compactModerationText,
  extractPhoneDigits,
  normalizeModerationText,
} from "@/features/moderation/helpers/textNormalize";

const AZ_MOBILE_PREFIXES = "50|51|55|70|77|99|10|12|60";

const PHONE_IN_TEXT_RE = new RegExp(
  String.raw`(?:\+?994|0)(?:[\s.\-/_*·]*\d){9,12}\b`,
  "i",
);

const EMAIL_RE = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i;

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/i;

const SHORT_LINK_RE =
  /\b(?:bit\.ly|t\.co|tinyurl\.com|goo\.gl|rb\.gy|is\.gd|cutt\.ly|shorturl\.at)\/\S+/i;

const IG_LINK_RE = /\b(?:instagram\.com|instagr\.am)\/\S+/i;

const WA_LINK_RE = /\bwa\.me\/[\d+]+/i;

const TG_LINK_RE = /\b(?:t\.me|telegram\.me)\/\S+/i;

const SOCIAL_COMPACT_MARKERS = [
  "instagram",
  "instagrem",
  "instgram",
  "инстаграм",
  "whatsapp",
  "watsapp",
  "vatsapp",
  "watssap",
  "vatsap",
  "ватсап",
  "telegram",
  "telgram",
  "telqram",
  "teleqram",
  "snapchat",
  "facebook",
  "messenger",
  "mesenger",
] as const;

const SOCIAL_WORD_PATTERNS = [
  /\binstagram\b/,
  /\binsta\b/,
  /\binstagr\b/,
  /\binstagrem\b/,
  /\binstgram\b/,
  /\big\b/,
  /\bwhatsapp\b/,
  /\bwatsapp\b/,
  /\bvatsap\b/,
  /\btelegram\b/,
  /\btelgram\b/,
  /\btelqram\b/,
  /\bviber\b/,
  /\btiktok\b/,
  /\bwp\b/,
] as const;

const HANDLE_RE = /(?:^|[\s([{"'])@([a-z0-9_.]{3,30})\b/i;

const IG_HANDLE_RE =
  /\b(?:instagram|insta|instagr|ig)\s*(?:da|de|də|den|dən|dan|:|@)\s*@?([a-z0-9_.]{3,30})\b/i;

export const CONTACT_INFO_ERROR =
  "Telefon, WhatsApp, Instagram və digər əlaqə məlumatı yazmaq olmaz. Əlaqə yalnız mesajla.";

export const CONTACT_INFO_CHAT_WARNING =
  "Nömrə və ya sosial şəbəkə paylaşırsan. Yalnız tanıdığın və etibar etdiyin insanlara göndər. Davam edək?";

function hasAzMobileDigits(digits: string): boolean {
  const prefix = new RegExp(
    String.raw`^(?:994(?:${AZ_MOBILE_PREFIXES})|0(?:${AZ_MOBILE_PREFIXES})|(?:${AZ_MOBILE_PREFIXES}))\d{7}$`,
  );

  for (let index = 0; index < digits.length; index += 1) {
    const chunk12 = digits.slice(index, index + 12);
    if (prefix.test(chunk12)) {
      return true;
    }

    const chunk10 = digits.slice(index, index + 10);
    if (prefix.test(chunk10)) {
      return true;
    }

    const chunk9 = digits.slice(index, index + 9);
    if (prefix.test(chunk9)) {
      return true;
    }
  }

  return false;
}

function hasPhoneNumber(text: string): boolean {
  if (PHONE_IN_TEXT_RE.test(text)) {
    return true;
  }

  return hasAzMobileDigits(extractPhoneDigits(text));
}

function hasSocialMarker(text: string): boolean {
  const normalized = normalizeModerationText(text);
  const compact = compactModerationText(text);

  if (SOCIAL_COMPACT_MARKERS.some((marker) => compact.includes(marker))) {
    return true;
  }

  return SOCIAL_WORD_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasExternalLink(text: string): boolean {
  return (
    URL_RE.test(text) ||
    SHORT_LINK_RE.test(text) ||
    IG_LINK_RE.test(text) ||
    WA_LINK_RE.test(text) ||
    TG_LINK_RE.test(text)
  );
}

function hasSocialHandle(text: string): boolean {
  const normalized = normalizeModerationText(text);
  return HANDLE_RE.test(normalized) || IG_HANDLE_RE.test(normalized);
}

export function containsContactInfo(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return (
    hasPhoneNumber(normalized) ||
    hasSocialMarker(normalized) ||
    hasExternalLink(normalized) ||
    EMAIL_RE.test(normalized) ||
    hasSocialHandle(normalized)
  );
}
