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
  "ibne",
  "yarak",
  "yarrak",
  "tasak",
  "tasagi",
  "gotveren",
  "sikeyim",
  "sikerim",
  "sikiyor",
  "sikiyorum",
  "salak",
  "anan",
  "ebanat",
  "ebany",
  "ebator",
  "nahui",
  "nahuy",
  "nakhui",
  "pizdabol",
  "shalava",
  "prostitutka",
  "chmo",
  "dolboeb",
  "pidor",
  "pedik",
  "gandon",
  "vrot",
  "mudilo",
  "svoloch",
  "ublyudok",
] as const;

const PROFANITY_PHRASES = [
  "sikim senin",
  "sikim amina",
  "amina sikim",
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
  "amina koyim",
  "amina koyayim",
  "amina koyarim",
  "anani sikerim",
  "sikeyim seni",
  "sikerim seni",
  "idi nahui",
  "poshel nahui",
  "idi nahuja",
] as const;

const PROFANITY_ROOT_PATTERNS = [
  /\bsik(?:tir|dir|im|imin|ine|ik|sin|es|ilmis|is|bas|erim|eyim|er|iyor|iyorum)\w*\b/,
  /\borospu\w*\b/,
  /\bgij(?:dillaq|duz|dillax)\b/,
  /\b(?:amciq|amcig)\w*\b/,
  /\b(?:pizd|pox|serefsiz|pezevenk|gerizekali)\w*\b/,
  /\b(?:qehbe|qanciq|fahise|kahpe)\w*\b/,
  /\b(?:ebal|ebat|eblan|cindir|dolbayob)\w*\b/,
  /\b(?:ibne|yarrak|yarak|tasak|gotveren|salak)\w*\b/,
  /\b(?:pidor|pedik|dolboeb|ebanat|nahui|nahuy|shalava|gandon|chmo|svoloch|ublyudok)\w*\b/,
  /\bamina\s*koy\w*\b/,
] as const;

const ALLOWED_PERSON_NAMES = [
  "amina",
  "aysel",
  "ayse",
  "aynur",
  "lamia",
  "lale",
  "nuray",
  "nigar",
  "samira",
  "guler",
  "sevinc",
  "turkan",
  "zeynab",
  "zeyneb",
] as const;

const ALLOWED_ANIMAL_NAMES = [
  "it",
  "pisik",
  "at",
  "inek",
  "keci",
  "quzu",
  "toyuq",
  "ordek",
  "donuz",
  "deve",
  "ayi",
  "dovshan",
  "sican",
  "ilan",
  "ari",
  "qus",
  "aslan",
  "fil",
  "balina",
  "panda",
  "tulku",
  "qunduz",
  "geyik",
  "ceyran",
  "qartal",
  "qaqqus",
  "baga",
  "tisbah",
  "kaplan",
  "zurafa",
  "timsah",
  "krokodil",
  "delfin",
  "meshin",
  "tovuz",
  "baliq",
  "kurbaqa",
  "papuqay",
  "dovqan",
] as const;

const ALLOWED_FRUIT_NAMES = [
  "alma",
  "armud",
  "banan",
  "nar",
  "uzum",
  "qarpiz",
  "gilas",
  "gavali",
  "heyva",
  "limon",
  "portocal",
  "mandarin",
  "ananas",
  "avokado",
  "kivi",
  "qaragat",
  "moruq",
  "ciyelek",
  "alca",
  "saftali",
  "erik",
  "incir",
  "zeytun",
  "xurma",
  "feijoa",
  "celek",
  "turunc",
  "malina",
  "qovun",
] as const;

const ALLOWED_VEGETABLE_NAMES = [
  "pomidor",
  "xiyar",
  "kelam",
  "kartof",
  "sogan",
  "sarimsaq",
  "yerkoku",
  "badimcan",
  "biber",
  "lobya",
  "noxud",
  "ispanaq",
  "kabak",
  "turp",
  "kereviz",
  "gundur",
  "semeni",
  "brokoli",
  "karnabahar",
  "svekla",
  "gobelek",
  "qargidali",
  "misir",
  "goyerti",
  "reyhan",
] as const;

const ALLOWED_EXACT_WORDS = new Set<string>([
  ...ALLOWED_PERSON_NAMES,
  ...ALLOWED_ANIMAL_NAMES,
  ...ALLOWED_FRUIT_NAMES,
  ...ALLOWED_VEGETABLE_NAMES,
]);

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

  if (ALLOWED_EXACT_WORDS.has(normalized)) {
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
