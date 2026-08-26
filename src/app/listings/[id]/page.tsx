import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { StartChatButton } from "@/features/chat/ui";
import { listingShowsPhotos } from "@/features/listings/model";
import { getListing } from "@/features/listings/queries";
import {
  AddListingPhotos,
  ArchiveListingButton,
  ListingDetailView,
  RestoreListingButton,
} from "@/features/listings/ui";
import { profileDisplayName } from "@/features/profile/model";
import { getProfile } from "@/features/profile/queries";
import { cn } from "@/lib/utils";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getCurrentUser()]);
  const owner = listing ? await getProfile(listing.userId) : null;

  if (!listing) {
    notFound();
  }

  const isOwner = user?.id === listing.userId;
  const editLink = (
    <Link
      href={`/listings/${listing.id}/edit`}
      className={cn(buttonVariants({ size: "lg" }), "inline-flex w-full sm:w-auto")}
    >
      Elanı dəyiş
    </Link>
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <ListingDetailView
        listing={listing}
        isOwner={isOwner}
        ownerExtra={
          listing.status === "active" ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {editLink}
                <ArchiveListingButton listingId={listing.id} />
              </div>
              {listingShowsPhotos(listing.type) ? (
                <AddListingPhotos listingId={listing.id} photos={listing.photos} />
              ) : null}
            </>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {editLink}
              <RestoreListingButton listingId={listing.id} />
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
            <StartChatButton listingId={listing.id} />
          ) : (
            <Link
              href={`/login?next=/listings/${listing.id}`}
              className={cn(buttonVariants({ size: "lg" }), "inline-flex w-fit")}
            >
              Mesaj yaz
            </Link>
          )
        }
      />
    </div>
  );
}
