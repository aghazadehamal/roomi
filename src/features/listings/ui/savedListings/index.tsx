import { ProfileListingCard } from "../profileListingCard";
import type { SavedListingsProps } from "./type";

export function SavedListings({ listings }: SavedListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-3xl bg-card px-6 py-8 text-center shadow-sm ring-1 ring-border">
        <p className="text-muted-foreground">
          Hələ seçilmiş elan yoxdur. Bəyəndiyin elanlarda saxla düyməsinə bas.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {listings.map((listing) => (
        <li key={listing.id}>
          <ProfileListingCard listing={listing} sideAction="view" />
        </li>
      ))}
    </ul>
  );
}
