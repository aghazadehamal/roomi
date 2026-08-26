import type { ReactNode } from "react";

import type { ListingDetail } from "@/features/listings/model";

export type ListingDetailViewProps = {
  listing: ListingDetail;
  isOwner: boolean;
  action?: ReactNode;
  ownerLink?: ReactNode;
  ownerExtra?: ReactNode;
};
