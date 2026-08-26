import { redirect } from "next/navigation";

import { ensureCurrentProfile, nameFromAuthUser } from "@/features/auth/queries";
import { listOwnListings } from "@/features/listings/queries";
import { OwnListings } from "@/features/listings/ui";
import { getOwnProfile } from "@/features/profile/queries";
import { ProfileForm, ProfileView } from "@/features/profile/ui";

export default async function OwnProfilePage() {
  const ensured = await ensureCurrentProfile();
  if (!ensured.user) {
    redirect("/login?next=/profile");
  }

  const [profile, listings] = await Promise.all([getOwnProfile(), listOwnListings()]);

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
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl tracking-tight">Elanların</h2>
        <OwnListings listings={listings} />
      </section>
    </div>
  );
}
