import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { newListingHref } from "@/features/listings/helpers/newListing";
import {
  FeedTab,
  LISTING_TYPE_LABELS,
  listingLocationText,
  listingPriceText,
  listingShowsPhotos,
} from "@/features/listings/model";
import { cn } from "@/lib/utils";

import type { OwnListingsProps } from "./type";

export function OwnListings({ listings }: OwnListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-card px-6 py-8 shadow-sm ring-1 ring-border">
        <p className="text-muted-foreground">Hələ elanın yoxdur.</p>
        <Link
          href={newListingHref(FeedTab.Offer)}
          className={cn(buttonVariants({ size: "lg" }), "w-fit gap-2")}
        >
          <Plus className="size-5" aria-hidden />
          Elan yerləşdir
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
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
