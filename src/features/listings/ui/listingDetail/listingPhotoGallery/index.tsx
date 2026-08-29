"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { ListingPhoto } from "../../listingPhoto";
import type { ListingPhotoGalleryProps } from "./type";

export function ListingPhotoGallery({ photos }: ListingPhotoGalleryProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "ArrowRight" && photos.length > 1) {
        setActive((index) => (index + 1) % photos.length);
      }
      if (event.key === "ArrowLeft" && photos.length > 1) {
        setActive((index) => (index - 1 + photos.length) % photos.length);
      }
    }

    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, photos.length]);

  if (photos.length === 0) {
    return <div className="aspect-[16/9] bg-muted" />;
  }

  const lightbox =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-black"
        onClick={() => setOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Şəkil"
      >
        <div className="flex shrink-0 justify-end p-3 sm:p-4">
          <button
            type="button"
            className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            aria-label="Bağla"
          >
            <X className="size-6" />
          </button>
        </div>
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-6 sm:px-16 sm:pb-8"
          onClick={() => setOpen(false)}
        >
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:left-4"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((index) => (index - 1 + photos.length) % photos.length);
                }}
                aria-label="Əvvəlki şəkil"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:right-4"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((index) => (index + 1) % photos.length);
                }}
                aria-label="Növbəti şəkil"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
          <div
            className="relative h-full w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <ListingPhoto
              src={photos[active]}
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className="relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden bg-muted"
        onClick={() => setOpen(true)}
        aria-label="Şəkli böyüt"
      >
        <ListingPhoto
          src={photos[active]}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </button>
      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-6 pt-4">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition-[ring-color]",
                index === active ? "ring-primary" : "ring-transparent hover:ring-border",
              )}
              onClick={() => setActive(index)}
              aria-label={`Şəkil ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            >
              <ListingPhoto src={url} className="object-cover" sizes="112px" />
            </button>
          ))}
        </div>
      ) : null}
      {lightbox}
    </>
  );
}
