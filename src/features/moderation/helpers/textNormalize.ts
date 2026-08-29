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
    .replace(/[ğĞ]/g, "g")
    .replace(/[аА]/g, "a")
    .replace(/[еЕ]/g, "e")
    .replace(/[оО]/g, "o")
    .replace(/[рР]/g, "r")
    .replace(/[сС]/g, "s")
    .replace(/[тТ]/g, "t")
    .replace(/[иИ]/g, "i")
    .replace(/[нН]/g, "n")
    .replace(/[гГ]/g, "g")
    .replace(/[мМ]/g, "m");

  value = [...value].map((char) => LEET_MAP[char] ?? char).join("");
  return value
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactModerationText(text: string): string {
  return normalizeModerationText(text).replace(/[^a-z0-9]/g, "");
}

export function collapseRepeatedChars(text: string): string {
  return text.replace(/(.)\1+/g, "$1");
}

export function extractDigits(text: string): string {
  return text.replace(/\D/g, "");
}
