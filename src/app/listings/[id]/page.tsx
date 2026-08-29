import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { MessageCircle, PencilLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { listingJsonLd, listingMetadata } from "@/features/listings/helpers/listingSeo";
import { getListing } from "@/features/listings/queries";
import {
  ArchiveListingButton,
  JsonLd,
  ListingDetailView,
  RestoreListingButton,
} from "@/features/listings/ui";
import {
  ListingGuestAction,
  ListingGuestActionFallback,
} from "@/features/listings/ui/listingDetail/listingGuestAction";
import { ListingGuestExtras } from "@/features/listings/ui/listingDetail/listingGuestExtras";
import { ListingOwnerLink } from "@/features/listings/ui/listingDetail/listingOwnerLink";
import { cn } from "@/lib/utils";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) {
    return { title: "Elan tapılmadı" };
  }
  return listingMetadata(listing);
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getCurrentUser()]);

  if (!listing) {
    notFound();
  }

  const isOwner = user?.id === listing.userId;
  const isGuest = Boolean(user && !isOwner);
  const jsonLd = listingJsonLd(listing);
  const editLink = (
    <Link
      href={`/listings/${listing.id}/edit`}
      className={cn(buttonVariants({ size: "lg" }), "inline-flex w-full gap-2 sm:w-auto")}
    >
      <PencilLine className="size-5" aria-hidden />
      Elanı redaktə et
    </Link>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ListingDetailView
        listing={listing}
        isOwner={isOwner}
        ownerExtra={
          listing.status === "active" ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {editLink}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ArchiveListingButton listingId={listing.id} />
                  <ArchiveListingButton listingId={listing.id} mode="delete" />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {editLink}
              <RestoreListingButton listingId={listing.id} />
              <ArchiveListingButton listingId={listing.id} mode="delete" />
            </div>
          )
        }
        ownerLink={
          !isOwner ? (
            <Suspense
              fallback={<div className="h-4 w-40 animate-pulse rounded bg-muted" />}
            >
              <ListingOwnerLink ownerId={listing.userId} />
            </Suspense>
          ) : null
        }
        action={
          isGuest ? (
            <Suspense fallback={<ListingGuestActionFallback />}>
              <ListingGuestAction listingId={listing.id} ownerId={listing.userId} />
            </Suspense>
          ) : !isOwner ? (
            <Link
              href={`/login?next=/listings/${listing.id}`}
              className={cn(buttonVariants({ size: "lg" }), "inline-flex w-fit gap-2")}
            >
              <MessageCircle className="size-5" aria-hidden />
              Mesaj yaz
            </Link>
          ) : null
        }
      />
      {isGuest ? (
        <Suspense fallback={null}>
          <ListingGuestExtras listingId={listing.id} ownerId={listing.userId} />
        </Suspense>
      ) : null}
    </div>
  );
}
