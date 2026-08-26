import { profileDisplayName, profileInitials } from "@/features/profile/model";

import type { ProfileViewProps } from "./type";

function joinedLabel(iso: string): string {
  const year = new Date(iso).getFullYear();
  return Number.isFinite(year) ? `${year}-dən Roomi-də` : "";
}

export function ProfileView({ profile, isOwn, extra }: ProfileViewProps) {
  const storedName = profile.name.trim();
  const heading =
    storedName.length > 0 ? storedName : isOwn ? "Profil" : profileDisplayName(profile.name);
  const joined = joinedLabel(profile.createdAt);

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-card px-8 py-10 shadow-sm ring-1 ring-border">
      <div className="flex items-start gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-heading text-2xl text-primary">
          {profileInitials(storedName)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-4xl tracking-tight">{heading}</h1>
          <p className="mt-2 text-muted-foreground">
            {[profile.city, joined].filter((item) => item.length > 0).join(" · ")}
          </p>
          {isOwn ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {storedName.length > 0
                ? "Bu sənin profilindir."
                : "Bu ad elanlarda və mesajlarda görünəcək."}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Mesaj yazmaq üçün elanına gir. Nömrə və Instagram burada yoxdur.
            </p>
          )}
        </div>
      </div>
      {extra}
    </div>
  );
}
