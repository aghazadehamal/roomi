"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

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
      if (event.key === "ArrowRight") {
        setActive((index) => (index + 1) % photos.length);
      }
      if (event.key === "ArrowLeft") {
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

  return (
    <>
      <button
        type="button"
        className="aspect-[16/9] w-full cursor-zoom-in bg-muted"
        onClick={() => setOpen(true)}
        aria-label="Şəkli böyüt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[active]} alt="" className="size-full object-cover" />
      </button>
      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-6 pt-4">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              className={cn(
                "h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2",
                index === active ? "ring-primary" : "ring-transparent",
              )}
              onClick={() => {
                setActive(index);
                setOpen(true);
              }}
              aria-label={`Şəkil ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Şəkil"
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-card p-2 text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            aria-label="Bağla"
          >
            <X className="size-6" />
          </button>
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 rounded-full bg-card p-2 text-foreground"
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
                className="absolute right-4 rounded-full bg-card p-2 text-foreground"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active]}
            alt=""
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
