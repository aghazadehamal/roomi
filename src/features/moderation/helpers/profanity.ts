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
  "gijdillaq",
  "gijduz",
  "gijdillax",
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
  "peysər",
  "peyser",
  "qancıq",
  "qanciq",
  "qehbe",
  "orospu",
  "orospunun",
  "orospuya",
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
  "cindir",
  "dalybask",
  "serefsiz",
  "pezevenk",
  "kahpe",
  "fahise",
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

export const PROFANITY_ERROR = "Kobud və ya uyğunsuz sözlər yazmaq olmaz.";

function compactProfanityText(text: string): string {
  return collapseRepeatedChars(compactModerationText(text));
}

export function containsProfanity(text: string): boolean {
  const normalized = normalizeModerationText(text);
  if (!normalized) {
    return false;
  }

  const compact = compactProfanityText(text);
  const padded = ` ${normalized} `;

  return PROFANITY_TERMS.some((term) => {
    const termCompact = term.replace(/\s+/g, "");

    if (term.length <= 4) {
      return padded.includes(` ${term} `);
    }

    return compact.includes(termCompact);
  });
}
