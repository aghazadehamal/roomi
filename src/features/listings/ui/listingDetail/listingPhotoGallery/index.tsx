"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ListingPhotoGalleryProps } from "./type";

export function ListingPhotoGallery({ photos }: ListingPhotoGalleryProps) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return <div className="aspect-[16/9] bg-muted" />;
  }

  return (
    <>
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[active]} alt="" className="size-full object-cover" />
      </div>
      {photos.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-6 pt-4">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              className={cn(
                "h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-2 transition-[ring-color]",
                index === active ? "ring-primary" : "ring-transparent hover:ring-border",
              )}
              onClick={() => setActive(index)}
              aria-label={`Şəkil ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
