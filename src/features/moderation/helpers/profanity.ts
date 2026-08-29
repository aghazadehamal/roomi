import {
  collapseRepeatedChars,
  compactModerationText,
  normalizeModerationText,
  stripEmoji,
} from "@/features/moderation/helpers/textNormalize";

const PROFANITY_TERMS = [
  "siktir",
  "sikdir",
  "sikim",
  "sikimin",
  "sikine",
  "sikik",
  "sikikler",
  "sikesen",
  "sikdirsin",
  "sikdirsinler",
  "siktirgit",
  "siksin",
  "siksinler",
  "siksiniz",
  "sikilmis",
  "sikilmisem",
  "sikbas",
  "sikbasi",
  "sikis",
  "sikismek",
  "gijdillaq",
  "gijduz",
  "gijdillax",
  "gotelek",
  "dolbayob",
  "dolbayoba",
  "gavat",
  "gavot",
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
  "amq",
  "ananisikim",
  "anasini",
  "anavi",
  "avrad",
  "babanni",
  "peysər",
  "peyser",
  "qancıq",
  "qanciq",
  "qehbe",
  "orospu",
  "orospunun",
  "orospuya",
  "orospucocugu",
  "orospuevladi",
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
  "poxa",
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
  "eblan",
  "cindir",
  "dalybask",
  "serefsiz",
  "pezevenk",
  "kahpe",
  "fahise",
  "gerizekali",
  "debil",
  "mudak",
  "urod",
  "razyeban",
  "oc",
  "ocu",
  "fuck",
  "fucking",
  "fucker",
  "motherfucker",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "cunt",
  "nigger",
  "nigga",
  "retard",
  "whore",
  "slut",
] as const;

const PROFANITY_PHRASES = [
  "sikim senin",
  "anani sikim",
  "anan avradini",
  "basini sikim",
  "sik basini",
  "sikdir get",
  "sikdir git",
  "siktir get",
  "siktir git",
  "sikdirsin get",
  "get sikdir",
  "defol get",
  "lanet olsun",
] as const;

const PROFANITY_ROOT_PATTERNS = [
  /\bsik(?:tir|dir|im|imin|ine|ik|sin|es|ilmis|is|bas)\w*\b/,
  /\borospu\w*\b/,
  /\bgij(?:dillaq|duz|dillax)\b/,
  /\b(?:amciq|amcig)\w*\b/,
  /\b(?:pizd|pox|serefsiz|pezevenk|gerizekali)\w*\b/,
  /\b(?:qehbe|qanciq|fahise|kahpe)\w*\b/,
  /\b(?:ebal|ebat|eblan|cindir|dolbayob)\w*\b/,
] as const;

export const PROFANITY_ERROR = "Kobud və ya uyğunsuz sözlər yazmaq olmaz.";

function compactProfanityText(text: string): string {
  return collapseRepeatedChars(compactModerationText(text));
}

function matchesTerm(normalized: string, compact: string, term: string): boolean {
  const termCompact = term.replace(/\s+/g, "");

  if (term.length <= 4) {
    return ` ${normalized} `.includes(` ${term} `);
  }

  if (` ${normalized} `.includes(` ${term} `)) {
    return true;
  }

  return compact.includes(termCompact);
}

export function containsProfanity(text: string): boolean {
  const cleaned = stripEmoji(text);
  const normalized = normalizeModerationText(cleaned);
  if (!normalized) {
    return false;
  }

  if (PROFANITY_ROOT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  const compact = compactProfanityText(cleaned);
  const paddedCompact = ` ${compact} `;

  if (PROFANITY_PHRASES.some((phrase) => compact.includes(phrase.replace(/\s+/g, "")))) {
    return true;
  }

  return PROFANITY_TERMS.some((term) => {
    if (matchesTerm(normalized, compact, term)) {
      return true;
    }

    const termCompact = term.replace(/\s+/g, "");
    if (termCompact.length <= 4) {
      return paddedCompact.includes(` ${termCompact} `);
    }

    return false;
  });
}
