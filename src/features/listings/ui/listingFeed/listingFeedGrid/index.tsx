"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { loadMoreListings } from "@/features/listings/actions";

import { ListingCard } from "../../listingCard";
import type { ListingFeedGridProps } from "./type";

export function ListingFeedGrid({
  tab,
  filters,
  initialListings,
  initialHasMore,
  savedListingIds,
  currentUserId,
}: ListingFeedGridProps) {
  const [listings, setListings] = useState(initialListings);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();
  const savedSet = new Set(savedListingIds);

  function onLoadMore() {
    startTransition(async () => {
      const result = await loadMoreListings(tab, filters, listings.length);
      if (!result.ok) {
        return;
      }

      setListings((current) => [...current, ...result.listings]);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
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
      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={pending}
          >
            {pending ? "Yüklənir…" : "Daha çox elan"}
          </Button>
        </div>
      ) : null}
    </>
  );
}
