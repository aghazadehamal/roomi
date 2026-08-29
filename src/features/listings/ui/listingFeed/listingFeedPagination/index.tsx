"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { loadMoreListings } from "@/features/listings/actions";
import type { ListingSummary } from "@/features/listings/model";

import { ListingCard } from "../../listingCard";
import type { ListingFeedPaginationProps } from "./type";

export function ListingFeedPagination({
  tab,
  filters,
  initialOffset,
  initialHasMore,
  savedListingIds,
  currentUserId,
}: ListingFeedPaginationProps) {
  const [extraListings, setExtraListings] = useState<ListingSummary[]>([]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();
  const savedSet = new Set(savedListingIds);

  function onLoadMore() {
    startTransition(async () => {
      const result = await loadMoreListings(
        tab,
        filters,
        initialOffset + extraListings.length,
      );
      if (!result.ok) {
        return;
      }

      setExtraListings((current) => [...current, ...result.listings]);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      {extraListings.map((listing) => (
        <li key={listing.id} className="h-full">
          <ListingCard
            listing={listing}
            saved={savedSet.has(listing.id)}
            showSave={Boolean(currentUserId && currentUserId !== listing.userId)}
          />
        </li>
      ))}
      {hasMore ? (
        <li className="col-span-full flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={pending}
          >
            {pending ? "Yüklənir…" : "Daha çox elan"}
          </Button>
        </li>
      ) : null}
    </>
  );
}
