import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries";
import { feedTabForListingType } from "@/features/listings/helpers/newListing";
import {
  ANY_DISTRICT,
  isAzCity,
  isBakuCity,
  isBakuDistrict,
  ListingType,
  type ListingDetail,
} from "@/features/listings/model";
import { getListing } from "@/features/listings/queries";
import { type ListingFormValues } from "@/features/listings/schema";
import { ListingForm } from "@/features/listings/ui";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

function toListingFormValues(listing: ListingDetail): ListingFormValues {
  const city = isAzCity(listing.city) ? listing.city : "Bakı";
  let district: ListingFormValues["district"] = ANY_DISTRICT;

  if (isBakuCity(city)) {
    if (listing.district === ANY_DISTRICT) {
      district = ANY_DISTRICT;
    } else if (isBakuDistrict(listing.district)) {
      district = listing.district;
    } else {
      district = "Yasamal";
    }
  }

  const housingKind =
    listing.type === ListingType.RoommateSeek
      ? "any"
      : listing.housingKind === "any" &&
          (listing.type === ListingType.HomeOffer || listing.type === ListingType.RoomOffer)
        ? "apartment"
        : listing.housingKind;

  return {
    type: listing.type,
    title: listing.title,
    body: listing.body,
    city,
    district,
    price: listing.priceAzn,
    rooms: listing.rooms,
    genderPref: listing.genderPref,
    housingKind,
  };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const [listing, user] = await Promise.all([getListing(id), getCurrentUser()]);

  if (!listing) {
    notFound();
  }

  if (!user) {
    redirect(`/login?next=/listings/${id}/edit`);
  }

  if (user.id !== listing.userId) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <Link href={`/listings/${listing.id}`} className="text-sm text-muted-foreground">
          Elana qayıt
        </Link>
        <h1 className="mt-3 font-heading text-4xl tracking-tight">Elanı dəyiş</h1>
      </div>
      <ListingForm
        isAuthenticated
        listingId={listing.id}
        tab={feedTabForListingType(listing.type)}
        defaultValues={toListingFormValues(listing)}
      />
    </div>
  );
}
