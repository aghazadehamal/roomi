import Link from "next/link";

import {
  LISTING_TYPE_LABELS,
  listingLocationText,
  listingPriceText,
  listingShowsPhotos,
} from "@/features/listings/model";

import type { SavedListingsProps } from "./type";

export function SavedListings({ listings }: SavedListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-3xl bg-card px-6 py-8 text-center shadow-sm ring-1 ring-border">
        <p className="text-muted-foreground">
          Hələ seçilmiş elan yoxdur. Bəyəndiyin elanlarda saxla düyməsinə bas.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {listings.map((listing) => (
        <li key={listing.id}>
          <Link
            href={`/listings/${listing.id}`}
            className="flex gap-4 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border"
          >
            {listing.photoUrl ? (
              <div className="size-24 shrink-0 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={listing.photoUrl} alt="" className="size-full object-cover" />
              </div>
            ) : listingShowsPhotos(listing.type) ? (
              <div className="size-24 shrink-0 bg-muted" />
            ) : null}
            <span className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
              <span className="text-sm font-medium text-primary">
                {LISTING_TYPE_LABELS[listing.type]}
              </span>
              <span className="mt-1 font-medium">{listing.title}</span>
              <span className="mt-1 text-sm text-muted-foreground">
                {listing.status === "active" ? "Aktiv" : "Arxiv"} ·{" "}
                {listingLocationText(listing.city, listing.district)} ·{" "}
                {listingPriceText(listing.priceAzn)}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
