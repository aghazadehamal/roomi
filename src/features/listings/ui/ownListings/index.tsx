import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { newListingHref } from "@/features/listings/helpers/newListing";
import { FeedTab } from "@/features/listings/model";
import { cn } from "@/lib/utils";

import { ProfileListingCard } from "../profileListingCard";
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
          <ProfileListingCard listing={listing} sideAction="manage" />
        </li>
      ))}
    </ul>
  );
}
