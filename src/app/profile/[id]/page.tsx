import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries";
import { listActiveListingsByUser } from "@/features/listings/queries";
import { ListingCard } from "@/features/listings/ui";
import { getBlockStatus } from "@/features/moderation/queries";
import { ModerationActions } from "@/features/moderation/ui";
import { getProfile } from "@/features/profile/queries";
import { ProfileView } from "@/features/profile/ui";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const [profile, user, listings] = await Promise.all([
    getProfile(id),
    getCurrentUser(),
    listActiveListingsByUser(id),
  ]);

  if (!profile) {
    notFound();
  }

  if (user?.id === profile.id) {
    redirect("/profile");
  }

  const blockStatus = user ? await getBlockStatus(profile.id) : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ProfileView profile={profile} isOwn={false} />
      {user ? (
        <ModerationActions
          targetUserId={profile.id}
          blockedByMe={blockStatus?.blockedByMe}
        />
      ) : null}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl tracking-tight">Elanları</h2>
          {listings.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {listings.length} aktiv elan
            </p>
          ) : null}
        </div>
        {listings.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {listings.map((listing) => (
              <li key={listing.id} className="h-full">
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl bg-card px-6 py-10 text-center shadow-sm ring-1 ring-border">
            <p className="text-muted-foreground">İndi aktiv elanı yoxdur.</p>
          </div>
        )}
      </section>
    </div>
  );
}
