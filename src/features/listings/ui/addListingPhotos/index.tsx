"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteListingPhoto } from "@/features/listings/actions";
import { MAX_LISTING_PHOTOS } from "@/features/listings/helpers/listingPhoto";
import { uploadListingPhotos } from "@/features/listings/helpers/uploadListingPhotos";
import { ListingPhotoPicker } from "@/features/listings/ui/listingPhotoPicker";

import type { AddListingPhotosProps } from "./type";

export function AddListingPhotos({ listingId, photos }: AddListingPhotosProps) {
  const router = useRouter();
  const remaining = MAX_LISTING_PHOTOS - photos.length;
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onUpload() {
    if (files.length === 0) {
      return;
    }
    setPending(true);
    const result = await uploadListingPhotos(listingId, files, photos.length);
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Şəkillər yükləndi");
    setFiles([]);
    router.refresh();
  }

  async function onDelete(photoId: string) {
    const confirmed = window.confirm("Bu şəkli silmək istəyirsən?");
    if (!confirmed) {
      return;
    }
    setDeletingId(photoId);
    const result = await deleteListingPhoto(listingId, photoId);
    setDeletingId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Şəkil silindi");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-secondary/60 p-5 ring-1 ring-border/70">
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
                onClick={() => {
                  void onDelete(photo.id);
                }}
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
        <ListingPhotoPicker files={files} maxCount={remaining} onChange={setFiles} />
      ) : (
        <p className="text-sm text-muted-foreground">Ən çox {MAX_LISTING_PHOTOS} şəkil olar.</p>
      )}
      {remaining > 0 ? (
        <Button
          type="button"
          size="lg"
          className="w-fit"
          disabled={pending || files.length === 0}
          onClick={() => {
            void onUpload();
          }}
        >
          {pending ? "Yüklənir…" : "Şəkilləri yüklə"}
        </Button>
      ) : null}
    </div>
  );
}
