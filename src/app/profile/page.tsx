import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ensureCurrentProfile, nameFromAuthUser } from "@/features/auth/queries";
import { getOwnProfile } from "@/features/profile/queries";
import { ProfileForm, ProfileListingsContent, ProfileListingsSkeleton, ProfileView } from "@/features/profile/ui";

export default async function OwnProfilePage() {
  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    redirect("/login?next=/profile");
  }

  const profile = await getOwnProfile();

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ProfileView
        profile={viewProfile}
        isOwn
        extra={<ProfileForm defaultName={name} />}
      />
      <Suspense fallback={<ProfileListingsSkeleton />}>
        <ProfileListingsContent />
      </Suspense>
    </div>
  );
}
