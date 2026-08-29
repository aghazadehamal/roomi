import {
  collapseRepeatedChars,
  compactModerationText,
  normalizeModerationText,
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
  "gijdillaq",
  "gijduz",
  "gijdillax",
  "gotelek",
  "dolbayob",
  "dolbayoba",
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
  "sikdir get",
  "sikdir git",
  "siktir get",
  "siktir git",
  "sikdirsin get",
  "get sikdir",
  "lanet olsun",
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
  const normalized = normalizeModerationText(text);
  if (!normalized) {
    return false;
  }

  const compact = compactProfanityText(text);
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
