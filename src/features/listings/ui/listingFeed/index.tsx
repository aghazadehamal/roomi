import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { listingFeedFiltersActive } from "@/features/listings/helpers/listingFeedFilters";
import { newListingHref } from "@/features/listings/helpers/newListing";
import { cn } from "@/lib/utils";

import { ListingCard } from "../listingCard";
import { EmptyState } from "./emptyState";
import { ListingFilters } from "./listingFilters";
import type { ListingFeedProps } from "./type";

export function ListingFeed({
  tab,
  listings,
  filters,
  savedListingIds = [],
  currentUserId = null,
}: ListingFeedProps) {
  const savedSet = new Set(savedListingIds);
  const hasListings = listings.length > 0;
  const filteredEmpty = !hasListings && listingFeedFiltersActive(filters);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">
          Azərbaycanda kirayə ev və otaq platforması
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları.
          Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.
        </p>
      </header>
      <ListingFilters
        tab={tab}
        filters={filters}
        action={
          <Link
            href={newListingHref(tab)}
            className={cn(buttonVariants({ size: "lg" }), "w-full shrink-0 sm:w-auto")}
          >
            <Plus className="size-6" aria-hidden />
            Elan yerləşdir
          </Link>
        }
      />
      {hasListings ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id} className="h-full">
              <ListingCard
                listing={listing}
                saved={savedSet.has(listing.id)}
                showSave={Boolean(currentUserId && currentUserId !== listing.userId)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState tab={tab} filtered={filteredEmpty} />
      )}
    </div>
  );
}
