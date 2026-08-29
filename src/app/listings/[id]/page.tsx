import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle, PencilLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { StartChatButton } from "@/features/chat/ui";
import { listingJsonLd, listingMetadata } from "@/features/listings/helpers/listingSeo";
import { getListing } from "@/features/listings/queries";
import {
  ArchiveListingButton,
  JsonLd,
  ListingDetailView,
  RestoreListingButton,
} from "@/features/listings/ui";
import { getBlockStatus } from "@/features/moderation/actions";
import { ModerationActions } from "@/features/moderation/ui";
import { SaveListingButton } from "@/features/listings/ui";
import { isListingSaved } from "@/features/listings/queries";
import { profileDisplayName } from "@/features/profile/model";
import { getProfile } from "@/features/profile/queries";
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
  const owner = listing ? await getProfile(listing.userId) : null;
  const blockStatus =
    listing && user && user.id !== listing.userId
      ? await getBlockStatus(listing.userId)
      : null;
  const saved =
    listing && user && user.id !== listing.userId
      ? await isListingSaved(listing.id)
      : false;

  if (!listing) {
    notFound();
  }

  const isOwner = user?.id === listing.userId;
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
          owner ? (
            <Link
              href={`/profile/${listing.userId}`}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {profileDisplayName(owner.name)} — profilə bax
            </Link>
          ) : null
        }
        action={
          user ? (
            blockStatus?.blocked ? (
              <p className="text-sm text-muted-foreground">
                Bu istifadəçi ilə mesajlaşmaq olmaz.
              </p>
            ) : (
              <StartChatButton listingId={listing.id} />
            )
          ) : (
            <Link
              href={`/login?next=/listings/${listing.id}`}
              className={cn(buttonVariants({ size: "lg" }), "inline-flex w-fit gap-2")}
            >
              <MessageCircle className="size-5" aria-hidden />
              Mesaj yaz
            </Link>
          )
        }
      />
      {user && !isOwner ? (
        <SaveListingButton listingId={listing.id} initialSaved={saved} />
      ) : null}
      {user && !isOwner ? (
        <ModerationActions
          targetUserId={listing.userId}
          listingId={listing.id}
          blockedByMe={blockStatus?.blockedByMe}
        />
      ) : null}
    </div>
  );
}
