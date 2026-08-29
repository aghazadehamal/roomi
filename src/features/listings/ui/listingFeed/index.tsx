import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { listingFeedFiltersActive } from "@/features/listings/helpers/listingFeedFilters";
import { newListingHref } from "@/features/listings/helpers/newListing";
import { cn } from "@/lib/utils";

import { EmptyState } from "./emptyState";
import { ListingFeedGrid } from "./listingFeedGrid";
import { ListingFilters } from "./listingFilters";
import type { ListingFeedProps } from "./type";

export function ListingFeed({
  tab,
  listings,
  hasMore,
  filters,
  savedListingIds = [],
  currentUserId = null,
}: ListingFeedProps) {
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
        <ListingFeedGrid
          key={`${tab}:${filters.city ?? ""}:${filters.district ?? ""}:${filters.maxPrice ?? ""}:${filters.rooms ?? ""}:${filters.housingKind ?? ""}`}
          tab={tab}
          filters={filters}
          initialListings={listings}
          initialHasMore={hasMore}
          savedListingIds={savedListingIds}
          currentUserId={currentUserId}
        />
      ) : (
        <EmptyState tab={tab} filtered={filteredEmpty} />
      )}
    </div>
  );
}
