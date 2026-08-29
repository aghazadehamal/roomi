const PROFANITY_TERMS = [
  "siktir",
  "sikdir",
  "sikim",
  "sikimin",
  "sikine",
  "sikik",
  "göt",
  "got",
  "götü",
  "gotu",
  "götün",
  "gotun",
  "amcıq",
  "amciq",
  "amcig",
  "amına",
  "amina",
  "amk",
  "peysər",
  "peyser",
  "qancıq",
  "qanciq",
  "orospu",
  "orospunun",
  "daşşaq",
  "dassaq",
  "daşşag",
  "dassag",
  "skm",
  "skmv",
  "sktr",
  "pic",
  "pici",
  "pox",
  "poxu",
  "blyad",
  "blyat",
  "bljat",
  "suka",
  "sukin",
  "sukinsyn",
  "hui",
  "khuy",
  "huy",
  "pizda",
  "pizdec",
  "pizdets",
  "ebat",
  "ebal",
  "ebatj",
  "fuck",
  "fucking",
  "fucker",
  "shit",
  "bitch",
  "asshole",
  "bastard",
];

export const PROFANITY_ERROR = "Kobud və ya uyğunsuz sözlər yazmaq olmaz.";

function normalizeForProfanity(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/[ıİ]/g, "i")
    .replace(/[əƏ]/g, "e")
    .replace(/[öÖ]/g, "o")
    .replace(/[üÜ]/g, "u")
    .replace(/[çÇ]/g, "c")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsProfanity(text: string): boolean {
  const normalized = normalizeForProfanity(text);
  if (!normalized) {
    return false;
  }

  const padded = ` ${normalized} `;
  return PROFANITY_TERMS.some((term) => padded.includes(` ${term} `));
}
