import { BedDouble, MapPin, UserRound, Wallet } from "lucide-react";

import {
  GENDER_PREF_LABELS,
  LISTING_TYPE_LABELS,
  ListingType,
  SEEK_TYPES,
  listingPriceText,
  listingRoomsText,
  listingShowsGender,
  listingShowsPhotos,
  listingShowsRooms,
} from "@/features/listings/model";
import { ANY_DISTRICT } from "@/features/listings/schema";

import { ListingPhotoGallery } from "./listingPhotoGallery";
import type { ListingDetailViewProps } from "./type";

type Fact = {
  icon: typeof MapPin;
  label: string;
  value: string;
};

function listingFacts(listing: ListingDetailViewProps["listing"]): Fact[] {
  const isSeek = SEEK_TYPES.includes(listing.type);
  const facts: Fact[] = [
    {
      icon: MapPin,
      label: "Rayon",
      value:
        listing.district === ANY_DISTRICT
          ? `${listing.city} · Fərqi yoxdur`
          : `${listing.city}, ${listing.district}`,
    },
  ];

  if (isSeek || listing.priceAzn <= 0) {
    facts.push({
      icon: Wallet,
      label: isSeek ? "Büdcə" : "Qiymət",
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

  if (listingShowsGender(listing.type)) {
    facts.push({
      icon: UserRound,
      label: listing.type === ListingType.RoommateSeek ? "Yoldaş" : "Kimə",
      value: GENDER_PREF_LABELS[listing.genderPref],
    });
  }

  return facts;
}

export function ListingDetailView({
  listing,
  isOwner,
  action,
  ownerLink,
  ownerExtra,
}: ListingDetailViewProps) {
  const photos =
    listing.photoUrls.length > 0
      ? listing.photoUrls
      : listing.photoUrl
        ? [listing.photoUrl]
        : [];
  const showGallery = photos.length > 0 || listingShowsPhotos(listing.type);
  const isSeek = SEEK_TYPES.includes(listing.type);
  const showHeroPrice = listing.priceAzn > 0;
  const facts = listingFacts(listing);

  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
      {showGallery ? (
        <ListingPhotoGallery photos={photos} />
      ) : (
        <div className="border-b border-border/70 bg-gradient-to-br from-primary/12 via-accent/40 to-secondary px-6 py-7 sm:px-10">
          <p className="text-sm font-medium text-primary">
            {LISTING_TYPE_LABELS[listing.type]}
          </p>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {isSeek
              ? "Axtarış elanı. Əlaqə yalnız mesajla."
              : "Elan detalları aşağıdadır."}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-7 px-6 py-7 sm:px-10 sm:py-9">
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {showGallery ? (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                {LISTING_TYPE_LABELS[listing.type]}
              </span>
            ) : null}
            {listing.status === "active" ? (
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {listing.daysLeft} gün qalıb
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Arxiv
              </span>
            )}
            {isOwner ? (
              <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                Sənin elanın
              </span>
            ) : null}
          </div>

          <div
            className={
              showHeroPrice
                ? "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
                : "flex flex-col gap-3"
            }
          >
            <h1 className="min-w-0 font-heading text-3xl tracking-tight text-balance sm:text-[2.35rem]">
              {listing.title}
            </h1>
            {showHeroPrice ? (
              <p className="shrink-0 font-heading text-3xl tracking-tight sm:text-right sm:text-[2.35rem]">
                {listingPriceText(listing.priceAzn)}
              </p>
            ) : null}
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {facts.map((fact) => {
              const Icon = fact.icon;
              return (
                <div
                  key={fact.label}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/80 px-4 py-3 ring-1 ring-border/60"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary ring-1 ring-border/70">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-0.5 truncate text-base font-medium">{fact.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </header>

        <section className="rounded-2xl bg-background/70 px-5 py-5 ring-1 ring-border/70 sm:px-6">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Təsvir
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-foreground/90">
            {listing.body}
          </p>
        </section>

        <footer className="flex flex-col gap-4 border-t border-border/80 pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {listing.status === "active"
              ? "Nömrə və Instagram paylaşmayın. Görüşü ictimai yerdə alın."
              : "Bu elan arxivdədir. Söhbətlər qalır."}
          </p>

          {isOwner ? (
            <div className="flex flex-col gap-4">{ownerExtra}</div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {action}
              {ownerLink}
            </div>
          )}
        </footer>
      </div>
    </article>
  );
}
