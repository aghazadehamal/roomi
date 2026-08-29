const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "z",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "c",
  ш: "s",
  щ: "s",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "u",
  я: "a",
};

const ARABIC_TO_LATIN: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "a",
  آ: "a",
  ب: "b",
  ت: "t",
  ث: "t",
  ج: "j",
  ح: "h",
  خ: "h",
  د: "d",
  ذ: "d",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "s",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "g",
  ف: "f",
  ق: "k",
  ك: "k",
  ک: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  ة: "a",
  و: "u",
  ي: "i",
  ی: "i",
  ى: "a",
  ء: "",
  ؤ: "u",
  ئ: "i",
  پ: "p",
  چ: "c",
  ژ: "z",
  گ: "g",
  ڤ: "v",
};

const WORD_TO_DIGIT: Record<string, string> = {
  sifir: "0",
  sifr: "0",
  zero: "0",
  nol: "0",
  bir: "1",
  one: "1",
  iki: "2",
  two: "2",
  uc: "3",
  ucc: "3",
  three: "3",
  dord: "4",
  dort: "4",
  four: "4",
  bes: "5",
  besh: "5",
  five: "5",
  alti: "6",
  six: "6",
  yeddi: "7",
  seven: "7",
  sekkiz: "8",
  sekiz: "8",
  eight: "8",
  doqquz: "9",
  doqqquz: "9",
  nine: "9",
};

export function normalizeModerationText(text: string): string {
  let value = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıİ]/g, "i")
    .replace(/[əƏ]/g, "e")
    .replace(/[öÖ]/g, "o")
    .replace(/[üÜ]/g, "u")
    .replace(/[çÇ]/g, "c")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g");

  value = [...value]
    .map((char) => ARABIC_TO_LATIN[char] ?? CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
  value = [...value].map((char) => LEET_MAP[char] ?? char).join("");
  return value
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEmojiDigits(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/(\d)\uFE0F?\u20E3/g, "$1")
    .replace(/[\u2460-\u2469]/g, (char) =>
      String.fromCodePoint(char.codePointAt(0)! - 0x2460 + 1),
    )
    .replace(/\u24EA/g, "0")
    .replace(/[\uFF10-\uFF19]/g, (char) =>
      String.fromCodePoint(char.codePointAt(0)! - 0xff10),
    );
}

export function stripEmoji(text: string): string {
  return text.replace(/\p{Extended_Pictographic}|\p{Emoji_Presentation}/gu, "");
}

export function compactModerationText(text: string): string {
  return normalizeModerationText(text).replace(/[^a-z0-9]/g, "");
}

export function collapseRepeatedChars(text: string): string {
  return text.replace(/(.)\1+/g, "$1");
}

export function extractDigits(text: string): string {
  return normalizeEmojiDigits(text).replace(/\D/g, "");
}

export function extractDigitsFromWords(text: string): string {
  const tokens = normalizeModerationText(text)
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);

  let digits = "";
  for (const token of tokens) {
    if (token === "plus" || token === "plyus") {
      continue;
    }

    const mapped = WORD_TO_DIGIT[token];
    if (mapped !== undefined) {
      digits += mapped;
      continue;
    }

    if (/^\d+$/.test(token)) {
      digits += token;
    }
  }

  return digits;
}

export function extractPhoneDigits(text: string): string {
  return extractDigits(text) + extractDigitsFromWords(text);
}
