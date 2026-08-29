import { getCurrentUser } from "@/features/auth/queries";
import {
  feedTabFromParam,
  newListingHref,
} from "@/features/listings/helpers/newListing";
import { FeedTab } from "@/features/listings/model";
import { getOwnActiveListing } from "@/features/listings/queries";
import { ListingForm } from "@/features/listings/ui";

type NewListingPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const user = await getCurrentUser();
  const { tab: tabParam } = await searchParams;
  const tab = feedTabFromParam(tabParam);
  const activeListing = user ? await getOwnActiveListing() : null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="font-heading text-4xl tracking-tight">
        {tab === FeedTab.Seek ? "Axtarış elanı" : "Elan yerləşdir"}
      </h1>
      <ListingForm
        isAuthenticated={Boolean(user)}
        tab={tab}
        loginNext={newListingHref(tab)}
        activeListing={activeListing}
      />
    </div>
  );
}
