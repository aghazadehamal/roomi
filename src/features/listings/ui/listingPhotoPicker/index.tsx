"use client";

import { useId, useState } from "react";

import { listingPhotoError } from "@/features/listings/helpers/listingPhoto";
import { cn } from "@/lib/utils";

import type { ListingPhotoPickerProps } from "./type";

export function ListingPhotoPicker({ files, maxCount, onChange }: ListingPhotoPickerProps) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const remaining = maxCount - files.length;

  function addFiles(list: FileList | null) {
    if (!list || remaining <= 0) {
      return;
    }

    const next = [...files];
    for (const file of Array.from(list).slice(0, remaining)) {
      const invalid = listingPhotoError(file);
      if (invalid) {
        setError(invalid);
        onChange(next);
        return;
      }
      next.push(file);
    }
    setError(null);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div key={`${file.name}-${file.size}-${index}`} className="relative size-24 overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="size-full object-cover"
            />
            <button
              type="button"
              className="absolute top-1 right-1 rounded-full bg-card/90 px-2 text-xs"
              onClick={() => {
                onChange(files.filter((_, fileIndex) => fileIndex !== index));
                setError(null);
              }}
            >
              ×
            </button>
          </div>
        ))}
        {remaining > 0 ? (
          <label
            htmlFor={inputId}
            className={cn(
              "flex size-24 cursor-pointer items-center justify-center rounded-2xl bg-secondary text-sm text-muted-foreground ring-1 ring-border",
            )}
          >
            + Şəkil
          </label>
        ) : null}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <p className="text-sm text-muted-foreground">
        Ən çox {maxCount} şəkil, hər biri 5 MB-a qədər (JPG, PNG, WebP).
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
