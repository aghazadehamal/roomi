import { parseListingFeedFilters } from "@/features/listings/helpers/listingFeedFilters";
import { feedTabFromParam } from "@/features/listings/helpers/newListing";
import { listListings } from "@/features/listings/queries";
import { ListingFeed } from "@/features/listings/ui";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
    city?: string;
    district?: string;
    maxPrice?: string;
    rooms?: string;
    housingKind?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tab = feedTabFromParam(params.tab);
  const filters = parseListingFeedFilters(params);
  const listings = await listListings(tab, filters);

  return <ListingFeed tab={tab} listings={listings} filters={filters} />;
}
