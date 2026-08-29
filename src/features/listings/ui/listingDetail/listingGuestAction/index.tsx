import { StartChatButton } from "@/features/chat/ui";
import { getListingGuestState } from "@/features/listings/queries";

type ListingGuestActionProps = {
  listingId: string;
  ownerId: string;
};

export async function ListingGuestAction({ listingId, ownerId }: ListingGuestActionProps) {
  const state = await getListingGuestState(listingId, ownerId);

  if (!state) {
    return null;
  }

  if (state.blockStatus.blocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Bu istifadəçi ilə mesajlaşmaq olmaz.
      </p>
    );
  }

  return <StartChatButton listingId={listingId} />;
}

export function ListingGuestActionFallback() {
  return <div className="h-11 w-36 animate-pulse rounded-xl bg-muted" />;
}
