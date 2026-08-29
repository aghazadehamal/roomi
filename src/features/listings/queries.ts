import { getCurrentUser } from "@/features/auth/queries";
import {
  FeedTab,
  ListingType,
  OFFER_TYPES,
  SEEK_TYPES,
  type ListingDetail,
  type ListingSummary,
  type OwnListing,
  type SavedListing,
  type ListingFeedFilters,
} from "@/features/listings/model";
import { ANY_DISTRICT, BAKU_CITY } from "@/features/listings/model/locations";
import { createClient } from "@/lib/supabase/server";

const MS_PER_DAY = 86_400_000;

function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / MS_PER_DAY));
}

function isListingType(value: string): value is ListingType {
  return (Object.values(ListingType) as string[]).includes(value);
}

function isListingStatus(value: string): value is ListingDetail["status"] {
  return value === "active" || value === "archived" || value === "closed";
}

function isGenderPref(value: string): value is ListingDetail["genderPref"] {
  return value === "any" || value === "female" || value === "male";
}

function isHousingKind(value: string): value is ListingDetail["housingKind"] {
  return value === "apartment" || value === "house" || value === "any";
}

async function photosByListing(
  listingIds: string[],
): Promise<Map<string, { id: string; url: string }[]>> {
  const byListing = new Map<string, { id: string; url: string }[]>();
  if (listingIds.length === 0) {
    return byListing;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("listing_photos")
    .select("id, listing_id, url, sort_order")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  for (const row of data ?? []) {
    const current = byListing.get(row.listing_id) ?? [];
    current.push({ id: row.id, url: row.url });
    byListing.set(row.listing_id, current);
  }

  return byListing;
}

export async function listListings(
  tab: FeedTab,
  filters: ListingFeedFilters,
): Promise<ListingSummary[]> {
  const types = tab === FeedTab.Seek ? SEEK_TYPES : OFFER_TYPES;
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at")
    .eq("status", "active")
    .in("type", types);

  if (filters.city) {
    query = query.eq("city", filters.city);
  }

  if (filters.district) {
    query = query.eq("city", BAKU_CITY);
    query = query.in("district", [filters.district, ANY_DISTRICT]);
  }

  if (filters.maxPrice !== null) {
    query = query.or(`price.lte.${filters.maxPrice},price.eq.0`);
  }

  if (filters.rooms !== null) {
    query = query.neq("type", ListingType.RoommateSeek);
    const roomMatch =
      filters.rooms >= 4 ? "rooms.gte.4" : `rooms.eq.${filters.rooms}`;
    query = query.or(
      `${roomMatch},and(type.eq.${ListingType.HomeSeek},rooms.eq.0)`,
    );
  }

  if (filters.housingKind) {
    query = query.in("housing_kind", [filters.housingKind, "any"]);
  }

  const { data, error } = await query.order("published_at", { ascending: false });

  if (error) {
    console.error("listListings failed", error.message);
    return [];
  }

  if (!data) {
    return [];
  }

  const photos = await photosByListing(data.map((row) => row.id));

  return data.flatMap((row) => {
    if (!isListingType(row.type) || !isHousingKind(row.housing_kind)) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
        housingKind: row.housing_kind,
        daysLeft: daysLeft(row.expires_at),
        photoUrl: listingPhotos[0]?.url ?? null,
      },
    ];
  });
}

export async function getListing(id: string): Promise<ListingDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, user_id, title, body, price, city, district, rooms, type, gender_pref, housing_kind, expires_at, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (
    error ||
    !data ||
    !isListingType(data.type) ||
    !isGenderPref(data.gender_pref) ||
    !isHousingKind(data.housing_kind) ||
    !isListingStatus(data.status)
  ) {
    return null;
  }

  const photos = await photosByListing([data.id]);
  const listingPhotos = photos.get(data.id) ?? [];
  const photoUrls = listingPhotos.map((photo) => photo.url);

  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    body: data.body,
    priceAzn: data.price,
    city: data.city,
    district: data.district,
    rooms: data.rooms,
    type: data.type,
    housingKind: data.housing_kind,
    genderPref: data.gender_pref,
    daysLeft: data.status === "active" ? daysLeft(data.expires_at) : 0,
    photoUrl: photoUrls[0] ?? null,
    photoUrls,
    photos: listingPhotos,
    status: data.status,
  };
}

export async function listActiveListingsByUser(
  userId: string,
): Promise<ListingSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const photos = await photosByListing(data.map((row) => row.id));

  return data.flatMap((row) => {
    if (!isListingType(row.type) || !isHousingKind(row.housing_kind)) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
        housingKind: row.housing_kind,
        daysLeft: daysLeft(row.expires_at),
        photoUrl: listingPhotos[0]?.url ?? null,
      },
    ];
  });
}

export async function listOwnListings(): Promise<OwnListing[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at, status")
    .eq("user_id", user.id)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const photos = await photosByListing(data.map((row) => row.id));

  return data.flatMap((row) => {
    if (
      !isListingType(row.type) ||
      !isListingStatus(row.status) ||
      !isHousingKind(row.housing_kind)
    ) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
        housingKind: row.housing_kind,
        daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
        photoUrl: listingPhotos[0]?.url ?? null,
        status: row.status,
      },
    ];
  });
}

export async function listSavedListingIds(): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) {
    return new Set();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id);

  if (error || !data) {
    return new Set();
  }

  return new Set(data.map((row) => row.listing_id));
}

export async function isListingSaved(listingId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  return Boolean(data);
}

export async function listSavedListings(): Promise<SavedListing[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const { data: savedRows, error: savedError } = await supabase
    .from("saved_listings")
    .select("listing_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (savedError || !savedRows || savedRows.length === 0) {
    return [];
  }

  const listingIds = savedRows.map((row) => row.listing_id);
  const { data, error } = await supabase
    .from("listings")
    .select("id, user_id, title, price, city, district, rooms, type, housing_kind, expires_at, status")
    .in("id", listingIds);

  if (error || !data) {
    return [];
  }

  const order = new Map(listingIds.map((id, index) => [id, index]));
  const photos = await photosByListing(listingIds);

  return data
    .flatMap((row) => {
      if (
        !isListingType(row.type) ||
        !isListingStatus(row.status) ||
        !isHousingKind(row.housing_kind)
      ) {
        return [];
      }

      const listingPhotos = photos.get(row.id) ?? [];

      return [
        {
          id: row.id,
          userId: row.user_id,
          title: row.title,
          priceAzn: row.price,
          city: row.city,
          district: row.district,
          rooms: row.rooms,
          type: row.type,
          housingKind: row.housing_kind,
          daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
          photoUrl: listingPhotos[0]?.url ?? null,
          status: row.status,
        },
      ];
    })
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
