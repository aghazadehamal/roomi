import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries";
import { feedTabForListingType } from "@/features/listings/helpers/newListing";
import {
  ANY_DISTRICT,
  ANY_METRO,
  isAzCity,
  isBakuCity,
  isBakuDistrict,
  isBakuMetroStation,
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
  let metro: ListingFormValues["metro"] = ANY_METRO;

  if (isBakuCity(city)) {
    if (
      listing.district === ANY_DISTRICT &&
      listing.type !== ListingType.RoommateSeek
    ) {
      district = ANY_DISTRICT;
    } else if (isBakuDistrict(listing.district)) {
      district = listing.district;
    } else {
      district = "Yasamal";
    }

    if (
      listing.metro === ANY_METRO &&
      listing.type === ListingType.HomeSeek
    ) {
      metro = ANY_METRO;
    } else if (isBakuMetroStation(listing.metro)) {
      metro = listing.metro;
    } else {
      metro = "Elmlər Akademiyası";
    }
  }

  const requiresConcreteHousing =
    listing.type === ListingType.HomeOffer ||
    listing.type === ListingType.RoomOffer ||
    listing.type === ListingType.RoommateSeek;

  const housingKind =
    listing.housingKind === "any" && requiresConcreteHousing
      ? "apartment"
      : listing.housingKind;

  const buildingAge =
    listing.buildingAge === "any" && requiresConcreteHousing
      ? "new"
      : listing.buildingAge;

  const genderPref =
    listing.type === ListingType.RoommateSeek &&
    (listing.genderPref === "any" || listing.genderPref === "family")
      ? "female"
      : listing.genderPref;

  return {
    type: listing.type,
    title: listing.title,
    body: listing.body,
    city,
    district,
    metro,
    price: listing.priceAzn,
    rooms: listing.rooms,
    genderPref,
    housingKind,
    buildingAge,
    floor: listing.floor,
    buildingFloors:
      listing.housingKind === "apartment" || housingKind === "apartment"
        ? listing.buildingFloors > 0
          ? listing.buildingFloors
          : 9
        : 0,
    areaSqm: listing.areaSqm,
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
        <h1 className="mt-3 font-heading text-4xl tracking-tight">Elanı redaktə et</h1>
      </div>
      <ListingForm
        isAuthenticated
        listingId={listing.id}
        tab={feedTabForListingType(listing.type)}
        defaultValues={toListingFormValues(listing)}
        existingPhotos={listing.photos}
      />
    </div>
  );
}
