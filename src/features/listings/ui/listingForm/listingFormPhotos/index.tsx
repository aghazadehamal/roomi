"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { deleteListingPhoto } from "@/features/listings/actions";
import { MAX_LISTING_PHOTOS } from "@/features/listings/helpers/listingPhoto";
import { ListingPhotoPicker } from "@/features/listings/ui/listingPhotoPicker";

import type { ListingFormPhotosProps } from "./type";

export function ListingFormPhotos({
  listingId,
  photos,
  onPhotosChange,
  newFiles,
  onNewFilesChange,
}: ListingFormPhotosProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const remaining = MAX_LISTING_PHOTOS - photos.length - newFiles.length;

  async function onConfirmDelete() {
    if (!photoToDelete) {
      return;
    }
    setDeletingId(photoToDelete);
    const result = await deleteListingPhoto(listingId, photoToDelete);
    setDeletingId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onPhotosChange(photos.filter((photo) => photo.id !== photoToDelete));
    toast.success("Şəkil silindi");
    setPhotoToDelete(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Şəkillər</p>
      {photos.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative size-24 overflow-hidden rounded-2xl bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 cursor-pointer rounded-full bg-card/90 p-1 text-foreground disabled:cursor-not-allowed"
                disabled={deletingId === photo.id}
                onClick={() => setPhotoToDelete(photo.id)}
                aria-label="Şəkli sil"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Hələ şəkil yoxdur.</p>
      )}
      {remaining > 0 ? (
        <ListingPhotoPicker files={newFiles} maxCount={remaining} onChange={onNewFilesChange} />
      ) : (
        <p className="text-sm text-muted-foreground">Ən çox {MAX_LISTING_PHOTOS} şəkil olar.</p>
      )}
      <ConfirmDialog
        open={photoToDelete !== null}
        onOpenChange={(open) => {
          if (!open && deletingId === null) {
            setPhotoToDelete(null);
          }
        }}
        title="Şəkli sil?"
        description="Bu şəkil elandan silinəcək. Geri qaytarmaq olmaz."
        confirmLabel={deletingId ? "Silinir…" : "Sil"}
        cancelLabel="Ləğv et"
        destructive
        pending={deletingId !== null}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
