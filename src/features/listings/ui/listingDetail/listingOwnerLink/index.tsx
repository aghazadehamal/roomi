import Link from "next/link";

import { profileDisplayName } from "@/features/profile/model";
import { getProfile } from "@/features/profile/queries";

type ListingOwnerLinkProps = {
  ownerId: string;
};

export async function ListingOwnerLink({ ownerId }: ListingOwnerLinkProps) {
  const owner = await getProfile(ownerId);

  if (!owner) {
    return null;
  }

  return (
    <Link
      href={`/profile/${ownerId}`}
      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      {profileDisplayName(owner.name)} — profilə bax
    </Link>
  );
}
