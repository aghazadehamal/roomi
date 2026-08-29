import { attachListingPhotos } from "@/features/listings/actions";
import {
  LISTING_PHOTO_BUCKET,
  listingPhotoError,
  listingPhotoExtension,
} from "@/features/listings/helpers/listingPhoto";
import { compressListingPhoto } from "@/features/listings/helpers/compressListingPhoto";
import { createClient } from "@/lib/supabase/client";

export async function uploadListingPhotos(
  listingId: string,
  files: File[],
  startOrder: number,
): Promise<{ error: string } | { urls: string[] }> {
  if (files.length === 0) {
    return { urls: [] };
  }

  const compressed: File[] = [];
  for (const file of files) {
    const prepared = await compressListingPhoto(file);
    const invalid = listingPhotoError(prepared);
    if (invalid) {
      return { error: invalid };
    }
    compressed.push(prepared);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Şəkil yükləmək üçün giriş et." };
  }

  const urls: string[] = [];

  for (const [index, file] of compressed.entries()) {
    const extension = listingPhotoExtension(file.type);
    if (!extension) {
      return { error: "Yalnız JPG, PNG və ya WebP yüklə." };
    }

    const path = `${user.id}/${listingId}/${startOrder + index}.${extension}`;
    const { error } = await supabase.storage.from(LISTING_PHOTO_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      return {
        error:
          "Şəkil yüklənmədi. SQL Editor-də 20260825000005_listing_photos.sql faylını Run et.",
      };
    }

    const { data } = supabase.storage.from(LISTING_PHOTO_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  const saved = await attachListingPhotos(listingId, urls);
  if (!saved.ok) {
    return { error: saved.error };
  }

  return { urls };
}
