export const BAKU_CITY = "Bakı" as const;

export const ANY_DISTRICT = "Fərqi yoxdur";

export const ANY_METRO = "Fərqi yoxdur";

export const BAKU_DISTRICTS = [
  "Binəqədi",
  "Qaradağ",
  "Xəzər",
  "Xətai",
  "Nərimanov",
  "Nəsimi",
  "Nizami",
  "Pirallahı",
  "Sabunçu",
  "Səbail",
  "Suraxanı",
  "Yasamal",
] as const;

/** Bakı metrosu stansiyaları (əlifba sırası). */
export const BAKU_METRO_STATIONS = [
  "20 Yanvar",
  "28 May",
  "8 Noyabr",
  "Avtovağzal",
  "Azadlıq prospekti",
  "Bakmil",
  "Cəfər Cabbarlı",
  "Dərnəgül",
  "Elmlər Akademiyası",
  "Gənclik",
  "Həzi Aslanov",
  "İçərişəhər",
  "İnşaatçılar",
  "Koroğlu",
  "Memar Əcəmi",
  "Nəriman Nərimanov",
  "Nəsimi",
  "Neftçilər",
  "Nizami",
  "Qara Qarayev",
  "Sahil",
  "Şah İsmail Xətai",
  "Ulduz",
  "Xalqlar Dostluğu",
  "Xocəsən",
  "Əhmədli",
] as const;

/** Azərbaycanın şəhərləri (Bakı birinci). */
export const AZ_CITIES = [
  BAKU_CITY,
  "Ağcabədi",
  "Ağdaş",
  "Ağdam",
  "Ağdərə",
  "Ağstafa",
  "Ağsu",
  "Astara",
  "Babək",
  "Balakən",
  "Beyləqan",
  "Bərdə",
  "Biləsuvar",
  "Cəbrayıl",
  "Cəlilabad",
  "Culfa",
  "Daşkəsən",
  "Füzuli",
  "Gədəbəy",
  "Gəncə",
  "Goranboy",
  "Göyçay",
  "Göygöl",
  "Hacıqabul",
  "Xaçmaz",
  "Xankəndi",
  "Xırdalan",
  "Xızı",
  "Xocalı",
  "Xocavənd",
  "İmişli",
  "İsmayıllı",
  "Kəlbəcər",
  "Kürdəmir",
  "Laçın",
  "Lənkəran",
  "Lerik",
  "Masallı",
  "Mingəçevir",
  "Naftalan",
  "Naxçıvan",
  "Neftçala",
  "Oğuz",
  "Ordubad",
  "Qax",
  "Qazax",
  "Qəbələ",
  "Qobustan",
  "Quba",
  "Qubadlı",
  "Qusar",
  "Saatlı",
  "Sabirabad",
  "Salyan",
  "Samux",
  "Siyəzən",
  "Şabran",
  "Şahbuz",
  "Şamaxı",
  "Şəki",
  "Şəmkir",
  "Şərur",
  "Şirvan",
  "Şuşa",
  "Sumqayıt",
  "Tərtər",
  "Tovuz",
  "Ucar",
  "Yardımlı",
  "Yevlax",
  "Zaqatala",
  "Zərdab",
] as const;

export type AzCity = (typeof AZ_CITIES)[number];
export type BakuDistrict = (typeof BAKU_DISTRICTS)[number];
export type BakuMetroStation = (typeof BAKU_METRO_STATIONS)[number];

export const LISTING_DISTRICTS = [...BAKU_DISTRICTS, ANY_DISTRICT] as const;
export const LISTING_METROS = [...BAKU_METRO_STATIONS, ANY_METRO] as const;

export function isBakuCity(city: string): city is typeof BAKU_CITY {
  return city === BAKU_CITY;
}

export function isAzCity(city: string): city is AzCity {
  return (AZ_CITIES as readonly string[]).includes(city);
}

export function isBakuDistrict(district: string): district is BakuDistrict {
  return (BAKU_DISTRICTS as readonly string[]).includes(district);
}

export function isBakuMetroStation(metro: string): metro is BakuMetroStation {
  return (BAKU_METRO_STATIONS as readonly string[]).includes(metro);
}

export function listingLocationFactLabel(
  city: string,
  district?: string,
): "Rayon" | "Şəhər" | "Ünvan" {
  if (isBakuCity(city)) {
    return "Rayon";
  }
  if (district && district !== ANY_DISTRICT) {
    return "Ünvan";
  }
  return "Şəhər";
}

export function listingLocationText(city: string, district: string): string {
  if (!isBakuCity(city)) {
    if (district && district !== ANY_DISTRICT) {
      return `${city}, ${district}`;
    }
    return city;
  }
  if (district === ANY_DISTRICT) {
    return "Fərqi yoxdur";
  }
  return district;
}

export function listingLocationDetailText(city: string, district: string): string {
  if (!isBakuCity(city)) {
    if (district && district !== ANY_DISTRICT) {
      return `${city}, ${district}`;
    }
    return city;
  }
  if (district === ANY_DISTRICT) {
    return `${city} · Fərqi yoxdur`;
  }
  return `${city}, ${district}`;
}

export function listingMetroText(metro: string): string {
  return metro === ANY_METRO || !metro ? "Fərqi yoxdur" : metro;
}
