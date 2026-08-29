"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentProfile } from "@/features/auth/queries";
import { ACTIVE_LISTING_LIMIT_MESSAGE } from "@/features/listings/helpers/activeListingLimit";
import { LISTING_PHOTO_BUCKET, MAX_LISTING_PHOTOS, listingPhotoStoragePath } from "@/features/listings/helpers/listingPhoto";
import { LISTING_TTL_DAYS, listingFormSchema, listingIdSchema, listingPhotoIdSchema } from "@/features/listings/schema";
import {
  FeedTab,
  type ListingFeedFilters,
  type ListingSummary,
} from "@/features/listings/model";
import { listListings } from "@/features/listings/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LoadMoreListingsResult =
  | { ok: true; listings: ListingSummary[]; hasMore: boolean }
  | { ok: false; error: string };

export async function loadMoreListings(
  tab: FeedTab,
  filters: ListingFeedFilters,
  offset: number,
): Promise<LoadMoreListingsResult> {
  if (!Number.isFinite(offset) || offset < 0) {
    return { ok: false, error: "Səhifələmə xətası." };
  }

  const result = await listListings(tab, filters, { offset });
  return { ok: true, listings: result.listings, hasMore: result.hasMore };
}

export type CreateListingResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createListing(input: unknown): Promise<CreateListingResult> {
  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Elan yerləşdirmək üçün giriş et." };
  }
  const user = ensured.user;

  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Formu yoxla.";
    return { ok: false, error: first };
  }

  const expiresAt = new Date(
    Date.now() + LISTING_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      city: parsed.data.city,
      district: parsed.data.district,
      price: parsed.data.price,
      rooms: parsed.data.rooms,
      gender_pref: parsed.data.genderPref,
      housing_kind: parsed.data.housingKind,
      status: "active",
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: ACTIVE_LISTING_LIMIT_MESSAGE,
      };
    }
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Profil tapılmadı. SQL Editor-də profile_trigger faylını Run et.",
      };
    }
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000002_grants.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Elan yadda saxlanılmadı. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${data.id}`);
  return { ok: true, id: data.id };
}

export async function updateListing(
  listingId: string,
  input: unknown,
): Promise<CreateListingResult> {
  const idParsed = listingIdSchema.safeParse({ listingId });
  if (!idParsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Dəyişmək üçün giriş et." };
  }

  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Formu yoxla.";
    return { ok: false, error: first };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", idParsed.data.listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== ensured.user.id) {
    return { ok: false, error: "Bu elanı dəyişə bilməzsən." };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      city: parsed.data.city,
      district: parsed.data.district,
      price: parsed.data.price,
      rooms: parsed.data.rooms,
      gender_pref: parsed.data.genderPref,
      housing_kind: parsed.data.housingKind,
    })
    .eq("id", listing.id)
    .eq("user_id", ensured.user.id);

  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000002_grants.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Elan yadda saxlanılmadı. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listing.id}`);
  revalidatePath(`/listings/${listing.id}/edit`);
  revalidatePath("/profile");
  revalidatePath("/messages");
  return { ok: true, id: listing.id };
}

export async function attachListingPhotos(
  listingId: string,
  urls: string[],
): Promise<CreateListingResult> {
  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Şəkil əlavə etmək üçün giriş et." };
  }

  if (urls.length === 0) {
    return { ok: true, id: listingId };
  }

  const { url: supabaseUrl } = getSupabaseEnv();
  const prefix = `${supabaseUrl}/storage/v1/object/public/listing-photos/${ensured.user.id}/${listingId}/`;
  if (urls.some((photoUrl) => !photoUrl.startsWith(prefix))) {
    return { ok: false, error: "Şəkil ünvanı uyğun gəlmir." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== ensured.user.id) {
    return { ok: false, error: "Bu elana şəkil əlavə etmək olmaz." };
  }

  const { count, error: countError } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (countError) {
    return { ok: false, error: "Şəkillər yoxlanılmadı. Bir az sonra yenə yoxla." };
  }

  const existing = count ?? 0;
  if (existing + urls.length > MAX_LISTING_PHOTOS) {
    return { ok: false, error: `Ən çox ${MAX_LISTING_PHOTOS} şəkil olar.` };
  }

  const { error } = await supabase.from("listing_photos").insert(
    urls.map((photoUrl, index) => ({
      listing_id: listingId,
      url: photoUrl,
      sort_order: existing + index,
    })),
  );

  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000005_listing_photos.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Şəkil yadda saxlanılmadı." };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listingId}`);
  return { ok: true, id: listingId };
}

export async function deleteListingPhoto(
  listingId: string,
  photoId: string,
): Promise<CreateListingResult> {
  const parsed = listingPhotoIdSchema.safeParse({ listingId, photoId });
  if (!parsed.success) {
    return { ok: false, error: "Şəkil tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Şəkil silmək üçün giriş et." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== ensured.user.id) {
    return { ok: false, error: "Bu şəkli silə bilməzsən." };
  }

  const { data: photo } = await supabase
    .from("listing_photos")
    .select("id, url, listing_id")
    .eq("id", parsed.data.photoId)
    .eq("listing_id", listing.id)
    .maybeSingle();

  if (!photo) {
    return { ok: false, error: "Şəkil tapılmadı." };
  }

  const { error } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photo.id)
    .eq("listing_id", listing.id);

  if (error) {
    return { ok: false, error: "Şəkil silinmədi. Bir az sonra yenə yoxla." };
  }

  const { url: supabaseUrl } = getSupabaseEnv();
  const path = listingPhotoStoragePath(photo.url, supabaseUrl, ensured.user.id, listing.id);
  if (path) {
    await supabase.storage.from(LISTING_PHOTO_BUCKET).remove([path]);
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listing.id}`);
  revalidatePath("/profile");
  return { ok: true, id: listing.id };
}

export async function archiveListing(listingId: string): Promise<CreateListingResult> {
  const parsed = listingIdSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Arxivə salmaq üçün giriş et." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== ensured.user.id) {
    return { ok: false, error: "Bu elanı arxivə sala bilməzsən." };
  }

  if (listing.status !== "active") {
    return { ok: false, error: "Bu elan artıq arxivdədir." };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "archived" })
    .eq("id", listing.id)
    .eq("user_id", ensured.user.id);

  if (error) {
    return { ok: false, error: "Arxivə salınmadı. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listing.id}`);
  revalidatePath("/listings/new");
  revalidatePath("/messages");
  revalidatePath("/profile");
  return { ok: true, id: listing.id };
}

export async function deleteListing(listingId: string): Promise<CreateListingResult> {
  const parsed = listingIdSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Silmək üçün giriş et." };
  }

  const userId = ensured.user.id;

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== userId) {
    return { ok: false, error: "Bu elanı silə bilməzsən." };
  }

  if (listing.status === "closed") {
    return { ok: false, error: "Bu elanı silmək olmaz." };
  }

  const { data: photos } = await supabase
    .from("listing_photos")
    .select("url")
    .eq("listing_id", listing.id);

  const { url: supabaseUrl } = getSupabaseEnv();
  const storagePaths = (photos ?? [])
    .map((photo) => listingPhotoStoragePath(photo.url, supabaseUrl, userId, listing.id))
    .filter((path): path is string => path !== null);

  if (storagePaths.length > 0) {
    await supabase.storage.from(LISTING_PHOTO_BUCKET).remove(storagePaths);
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listing.id)
    .eq("user_id", userId);

  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000014_listing_delete.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Elan silinmədi. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath("/listings/new");
  revalidatePath("/messages");
  revalidatePath("/profile");
  return { ok: true, id: listing.id };
}

export async function restoreListing(listingId: string): Promise<CreateListingResult> {
  const parsed = listingIdSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Aktiv etmək üçün giriş et." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (!listing || listing.user_id !== ensured.user.id) {
    return { ok: false, error: "Bu elanı aktiv edə bilməzsən." };
  }

  if (listing.status === "active") {
    return { ok: true, id: listing.id };
  }

  if (listing.status !== "archived") {
    return { ok: false, error: "Bu elanı aktiv etmək olmaz." };
  }

  const now = Date.now();
  const { error } = await supabase
    .from("listings")
    .update({
      status: "active",
      published_at: new Date(now).toISOString(),
      expires_at: new Date(now + LISTING_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", listing.id)
    .eq("user_id", ensured.user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Artıq aktiv elanın var. Əvvəlcə onu arxivə sal.",
      };
    }
    return { ok: false, error: "Aktiv edilmədi. Bir az sonra yenə yoxla." };
  }

  revalidatePath("/");
  revalidatePath(`/listings/${listing.id}`);
  revalidatePath("/listings/new");
  revalidatePath("/messages");
  revalidatePath("/profile");
  return { ok: true, id: listing.id };
}

export type SaveListingResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveListing(listingId: string): Promise<SaveListingResult> {
  const parsed = listingIdSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: ensured.error ?? "Seçilmişlərə əlavə etmək üçün giriş et." };
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (!listing) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  if (listing.user_id === ensured.user.id) {
    return { ok: false, error: "Öz elanını seçilmişlərə əlavə edə bilməzsən." };
  }

  if (listing.status !== "active") {
    return { ok: false, error: "Yalnız aktiv elanları saxlamaq olar." };
  }

  const { error } = await supabase.from("saved_listings").insert({
    user_id: ensured.user.id,
    listing_id: listing.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000013_saved_listings.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Seçilmişlərə əlavə olunmadı." };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/listings/${listing.id}`);
  return { ok: true };
}

export async function unsaveListing(listingId: string): Promise<SaveListingResult> {
  const parsed = listingIdSchema.safeParse({ listingId });
  if (!parsed.success) {
    return { ok: false, error: "Elan tapılmadı." };
  }

  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    return { ok: false, error: "Seçilmişdən çıxartmaq üçün giriş et." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", ensured.user.id)
    .eq("listing_id", parsed.data.listingId);

  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        error: "Cədvələ icazə yoxdur. SQL Editor-də 20260825000013_saved_listings.sql faylını Run et.",
      };
    }
    return { ok: false, error: "Seçilmişdən çıxarılmadı." };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath(`/listings/${parsed.data.listingId}`);
  return { ok: true };
}
