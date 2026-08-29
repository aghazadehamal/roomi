import { listOwnListings, listSavedListings } from "@/features/listings/queries";
import { OwnListings, SavedListings } from "@/features/listings/ui";

export async function ProfileListingsContent() {
  const [listings, savedListings] = await Promise.all([
    listOwnListings(),
    listSavedListings(),
  ]);

  const activeListingCount = listings.filter((listing) => listing.status === "active").length;
  const ownListingsCountLabel =
    listings.length === 0
      ? null
      : activeListingCount === listings.length
        ? `${activeListingCount} aktiv`
        : activeListingCount === 0
          ? `${listings.length} elan`
          : `${activeListingCount} aktiv · ${listings.length} elan`;

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl tracking-tight">Elanların</h2>
            {listings.length > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Redaktə, arxiv və silmək üçün elana daxil ol.
              </p>
            ) : null}
          </div>
          {ownListingsCountLabel ? (
            <p className="text-sm text-muted-foreground">{ownListingsCountLabel}</p>
          ) : null}
        </div>
        <OwnListings listings={listings} />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">Seçilmişlər</h2>
          {savedListings.length > 0 ? (
            <p className="text-sm text-muted-foreground">{savedListings.length} elan</p>
          ) : null}
        </div>
        <SavedListings listings={savedListings} />
      </section>
    </>
  );
}
