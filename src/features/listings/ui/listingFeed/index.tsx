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

export function ListingFeed({ tab, listings, filters }: ListingFeedProps) {
  const hasListings = listings.length > 0;
  const filteredEmpty = !hasListings && listingFeedFiltersActive(filters);

  return (
    <div className="flex flex-1 flex-col gap-8">
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
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState tab={tab} filtered={filteredEmpty} />
      )}
    </div>
  );
}
