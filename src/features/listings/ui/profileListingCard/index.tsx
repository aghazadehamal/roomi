import Link from "next/link";
import { ArrowUpRight, Search, Settings2 } from "lucide-react";

import {
  LISTING_TYPE_LABELS,
  SEEK_TYPES,
  listingProfileMeta,
  listingShowsPhotos,
} from "@/features/listings/model";

import { ListingPhoto } from "../listingPhoto";
import type { ProfileListingCardProps } from "./type";

function ListingThumbnail({
  photoUrl,
  isSeek,
  showPhotoSlot,
}: {
  photoUrl: string | null;
  isSeek: boolean;
  showPhotoSlot: boolean;
}) {
  if (photoUrl) {
    return (
      <div className="relative w-24 shrink-0 self-stretch bg-muted">
        <ListingPhoto
          src={photoUrl}
          className="object-cover"
          sizes="96px"
        />
      </div>
    );
  }

  if (isSeek) {
    return (
      <div className="flex w-24 shrink-0 self-stretch items-center justify-center bg-muted text-muted-foreground">
        <Search className="size-7" aria-hidden />
      </div>
    );
  }

  if (showPhotoSlot) {
    return <div className="w-24 shrink-0 self-stretch bg-muted" />;
  }

  return null;
}

export function ProfileListingCard({ listing, sideAction }: ProfileListingCardProps) {
  const isSeek = SEEK_TYPES.includes(listing.type);
  const showPhotoSlot = listingShowsPhotos(listing.type);
  const showManage = sideAction === "manage" && listing.status !== "closed";
  const showView = sideAction === "view";

  const sideLinkClassName =
    "flex shrink-0 flex-col items-center justify-center gap-1 border-l border-border px-4 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-primary";

  return (
    <div className="flex overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
      <Link href={`/listings/${listing.id}`} className="flex min-w-0 flex-1 items-stretch">
        <ListingThumbnail
          photoUrl={listing.photoUrl}
          isSeek={isSeek}
          showPhotoSlot={showPhotoSlot}
        />
        <span className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <span className="text-sm font-medium text-primary">
            {LISTING_TYPE_LABELS[listing.type]}
          </span>
          <span className="mt-1 font-medium">{listing.title}</span>
          <span className="mt-1 text-sm text-muted-foreground">
            {listingProfileMeta(listing)}
          </span>
        </span>
      </Link>
      {showManage ? (
        <Link
          href={`/listings/${listing.id}`}
          className={sideLinkClassName}
          aria-label="Elanı idarə et"
        >
          <Settings2 className="size-4" aria-hidden />
          <span className="text-xs font-medium">İdarə et</span>
        </Link>
      ) : null}
      {showView ? (
        <Link href={`/listings/${listing.id}`} className={sideLinkClassName} aria-label="Elana bax">
          <ArrowUpRight className="size-4" aria-hidden />
          <span className="text-xs font-medium">Bax</span>
        </Link>
      ) : null}
    </div>
  );
}
