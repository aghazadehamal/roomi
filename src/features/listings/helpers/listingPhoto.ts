export const LISTING_PHOTO_BUCKET = "listing-photos";
export const MAX_LISTING_PHOTOS = 5;
export const MAX_LISTING_PHOTO_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function listingPhotoExtension(type: string): "jpg" | "png" | "webp" | null {
  if (type === "image/jpeg") {
    return "jpg";
  }
  if (type === "image/png") {
    return "png";
  }
  if (type === "image/webp") {
    return "webp";
  }
  return null;
}

export function listingPhotoError(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Yalnız JPG, PNG və ya WebP yüklə.";
  }
  if (file.size > MAX_LISTING_PHOTO_BYTES) {
    return "Şəkil 5 MB-dan böyük ola bilməz.";
  }
  return null;
}

export function listingPhotoStoragePath(
  publicUrl: string,
  supabaseUrl: string,
  userId: string,
  listingId: string,
): string | null {
  const prefix = `${supabaseUrl}/storage/v1/object/public/${LISTING_PHOTO_BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) {
    return null;
  }

  const path = decodeURIComponent(publicUrl.slice(prefix.length));
  if (!path.startsWith(`${userId}/${listingId}/`)) {
    return null;
  }

  return path;
}
