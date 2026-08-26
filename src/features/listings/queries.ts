import { getCurrentUser } from "@/features/auth/queries";
import {
  FeedTab,
  ListingType,
  OFFER_TYPES,
  SEEK_TYPES,
  type ListingDetail,
  type ListingSummary,
  type OwnListing,
  type ListingFeedFilters,
} from "@/features/listings/model";
import { ANY_DISTRICT } from "@/features/listings/schema";
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
    .select("id, title, price, city, district, rooms, type, expires_at")
    .eq("status", "active")
    .in("type", types)
    .eq("city", "Bakı");

  if (filters.district) {
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
    if (!isListingType(row.type)) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
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
      "id, user_id, title, body, price, city, district, rooms, type, gender_pref, expires_at, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (
    error ||
    !data ||
    !isListingType(data.type) ||
    !isGenderPref(data.gender_pref) ||
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
    .select("id, title, price, city, district, rooms, type, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const photos = await photosByListing(data.map((row) => row.id));

  return data.flatMap((row) => {
    if (!isListingType(row.type)) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
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
    .select("id, title, price, city, district, rooms, type, expires_at, status")
    .eq("user_id", user.id)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const photos = await photosByListing(data.map((row) => row.id));

  return data.flatMap((row) => {
    if (!isListingType(row.type) || !isListingStatus(row.status)) {
      return [];
    }

    const listingPhotos = photos.get(row.id) ?? [];

    return [
      {
        id: row.id,
        title: row.title,
        priceAzn: row.price,
        city: row.city,
        district: row.district,
        rooms: row.rooms,
        type: row.type,
        daysLeft: row.status === "active" ? daysLeft(row.expires_at) : 0,
        photoUrl: listingPhotos[0]?.url ?? null,
        status: row.status,
      },
    ];
  });
}
