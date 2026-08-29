import Link from "next/link";
import { ArrowUpRight, BedDouble, Building2, MapPin, Wallet } from "lucide-react";

import {
  HOUSING_KIND_LABELS,
  LISTING_TYPE_LABELS,
  SEEK_TYPES,
  listingLocationFactLabel,
  listingLocationText,
  listingPriceText,
  listingRoomsText,
  listingShowsHousingKind,
  listingShowsPhotos,
  listingShowsRooms,
} from "@/features/listings/model";

import { SaveListingButton } from "../saveListingButton";
import type { ListingCardProps } from "./type";

type Fact = {
  icon: typeof MapPin;
  label: string;
  value: string;
};

function listingFacts(listing: ListingCardProps["listing"]): Fact[] {
  const isSeek = SEEK_TYPES.includes(listing.type);
  const facts: Fact[] = [
    {
      icon: MapPin,
      label: listingLocationFactLabel(listing.city),
      value: listingLocationText(listing.city, listing.district),
    },
  ];

  if (listingShowsHousingKind(listing.type)) {
    facts.push({
      icon: Building2,
      label: "Ev",
      value: HOUSING_KIND_LABELS[listing.housingKind],
    });
  }

  if (isSeek) {
    facts.push({
      icon: Wallet,
      label: "Büdcə",
      value: listingPriceText(listing.priceAzn),
    });
  }

  if (listingShowsRooms(listing.type)) {
    facts.push({
      icon: BedDouble,
      label: "Otaq",
      value: listingRoomsText(listing.rooms),
    });
  }

  return facts;
}

export function ListingCard({
  listing,
  saved = false,
  showSave = false,
}: ListingCardProps) {
  const isSeek = SEEK_TYPES.includes(listing.type);
  const hasPrice = listing.priceAzn > 0;
  const showPhotoSlot = Boolean(listing.photoUrl) || listingShowsPhotos(listing.type);
  const facts = listingFacts(listing);

  return (
    <div className="group/card relative h-full">
      <Link
        href={`/listings/${listing.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
      >
      {listing.photoUrl ? (
        <div className="relative aspect-[4/3] bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.photoUrl}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute top-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {LISTING_TYPE_LABELS[listing.type]}
          </span>
        </div>
      ) : showPhotoSlot ? (
        <div className="relative aspect-[4/3] bg-muted">
          <span className="absolute top-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {LISTING_TYPE_LABELS[listing.type]}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!showPhotoSlot ? (
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {LISTING_TYPE_LABELS[listing.type]}
              </p>
            ) : null}
            {hasPrice && !isSeek ? (
              <p className={`font-heading text-2xl tracking-tight ${showPhotoSlot ? "" : "mt-2"}`}>
                {listingPriceText(listing.priceAzn)}
              </p>
            ) : null}
            <h3
              className={`line-clamp-2 font-heading text-xl tracking-tight ${
                hasPrice && !isSeek
                  ? "mt-1 text-base font-medium"
                  : showPhotoSlot
                    ? ""
                    : "mt-2"
              }`}
            >
              {listing.title}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!showPhotoSlot && showSave ? (
              <SaveListingButton listingId={listing.id} initialSaved={saved} iconOnly />
            ) : null}
            <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-2">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-2xl bg-secondary/70 px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border/70">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {fact.label}
                  </dt>
                  <dd className="truncate text-sm font-medium">{fact.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="text-sm text-muted-foreground">{listing.daysLeft} gün qalıb</p>
          <p className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Bax
          </p>
        </div>
      </div>
      </Link>
      {showSave && showPhotoSlot ? (
        <div className="absolute top-3 right-3 z-10">
          <SaveListingButton listingId={listing.id} initialSaved={saved} iconOnly />
        </div>
      ) : null}
    </div>
  );
}
