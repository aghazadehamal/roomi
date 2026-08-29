export const BAKU_CITY = "Bakı" as const;

export const ANY_DISTRICT = "Fərqi yoxdur";

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

export const LISTING_DISTRICTS = [...BAKU_DISTRICTS, ANY_DISTRICT] as const;

export function isBakuCity(city: string): city is typeof BAKU_CITY {
  return city === BAKU_CITY;
}

export function isAzCity(city: string): city is AzCity {
  return (AZ_CITIES as readonly string[]).includes(city);
}

export function isBakuDistrict(district: string): district is BakuDistrict {
  return (BAKU_DISTRICTS as readonly string[]).includes(district);
}

export function listingLocationFactLabel(city: string): "Rayon" | "Şəhər" {
  return isBakuCity(city) ? "Rayon" : "Şəhər";
}

export function listingLocationText(city: string, district: string): string {
  if (!isBakuCity(city)) {
    return city;
  }
  if (district === ANY_DISTRICT) {
    return "Fərqi yoxdur";
  }
  return district;
}

export function listingLocationDetailText(city: string, district: string): string {
  if (!isBakuCity(city)) {
    return city;
  }
  if (district === ANY_DISTRICT) {
    return `${city} · Fərqi yoxdur`;
  }
  return `${city}, ${district}`;
}
