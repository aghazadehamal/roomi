import { redirect } from "next/navigation";

import { ensureCurrentProfile, nameFromAuthUser } from "@/features/auth/queries";
import { listOwnListings, listSavedListings } from "@/features/listings/queries";
import { OwnListings, SavedListings } from "@/features/listings/ui";
import { getOwnProfile } from "@/features/profile/queries";
import { ProfileForm, ProfileView } from "@/features/profile/ui";

export default async function OwnProfilePage() {
  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    redirect("/login?next=/profile");
  }

  const [profile, listings, savedListings] = await Promise.all([
    getOwnProfile(),
    listOwnListings(),
    listSavedListings(),
  ]);

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-3xl bg-card px-8 py-10 shadow-sm ring-1 ring-border">
        <h1 className="font-heading text-4xl tracking-tight">Profil tapılmadı</h1>
        <p className="text-muted-foreground">
          Profil yaradıla bilmədi. SQL Editor-də profile_trigger faylını Run et.
        </p>
      </div>
    );
  }

  const name =
    profile.name.trim() || ensured.name || nameFromAuthUser(ensured.user);
  const viewProfile = { ...profile, name };
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ProfileView
        profile={viewProfile}
        isOwn
        extra={<ProfileForm defaultName={name} />}
      />
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
    </div>
  );
}
