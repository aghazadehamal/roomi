export type NestedListingPhoto = {
  id?: string;
  url: string;
  sort_order: number;
};

export function normalizeNestedPhotos(
  photos: NestedListingPhoto | NestedListingPhoto[] | null | undefined,
): NestedListingPhoto[] | null {
  if (!photos) {
    return null;
  }
  return Array.isArray(photos) ? photos : [photos];
}

export function sortedListingPhotos(
  photos: NestedListingPhoto | NestedListingPhoto[] | null | undefined,
): { id: string; url: string }[] {
  return [...(normalizeNestedPhotos(photos) ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo, index) => ({
      id: photo.id ?? `photo-${index}`,
      url: photo.url,
    }));
}

export function coverPhotoUrl(
  photos: NestedListingPhoto | NestedListingPhoto[] | null | undefined,
): string | null {
  return sortedListingPhotos(photos)[0]?.url ?? null;
}

export const LISTING_PHOTOS_FOREIGN_TABLE = "listing_photos";

export function applyCoverPhotoLimit<T extends {
  order: (
    column: string,
    options?: { referencedTable?: string; ascending?: boolean },
  ) => T;
  limit: (count: number, options?: { referencedTable?: string }) => T;
}>(query: T): T {
  return query
    .order("sort_order", {
      referencedTable: LISTING_PHOTOS_FOREIGN_TABLE,
      ascending: true,
    })
    .limit(1, { referencedTable: LISTING_PHOTOS_FOREIGN_TABLE });
}

export const LISTING_SUMMARY_SELECT =
  "id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at, listing_photos ( url, sort_order )";

export const LISTING_DETAIL_SELECT =
  "id, user_id, title, body, price, city, district, rooms, type, gender_pref, housing_kind, expires_at, status, listing_photos ( id, url, sort_order )";

export const LISTING_OWN_SELECT =
  "id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at, status, listing_photos ( url, sort_order )";
