import type { ReactNode } from "react";

import type { Profile } from "@/features/profile/model";

export type ProfileViewProps = {
  profile: Profile;
  isOwn: boolean;
  extra?: ReactNode;
};
