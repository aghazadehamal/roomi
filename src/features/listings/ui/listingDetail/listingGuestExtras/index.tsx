import { SaveListingButton } from "@/features/listings/ui/saveListingButton";
import { getListingGuestState } from "@/features/listings/queries";
import { ModerationActions } from "@/features/moderation/ui";

type ListingGuestExtrasProps = {
  listingId: string;
  ownerId: string;
};

export async function ListingGuestExtras({ listingId, ownerId }: ListingGuestExtrasProps) {
  const state = await getListingGuestState(listingId, ownerId);

  if (!state) {
    return null;
  }

  return (
    <>
      <SaveListingButton listingId={listingId} initialSaved={state.saved} />
      <ModerationActions
        targetUserId={ownerId}
        listingId={listingId}
        blockedByMe={state.blockStatus.blockedByMe}
      />
    </>
  );
}
