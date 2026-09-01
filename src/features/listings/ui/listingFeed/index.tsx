import Link from "next/link";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { newListingHref } from "@/features/listings/helpers/newListing";
import { cn } from "@/lib/utils";

import { ListingFilters } from "./listingFilters";
import type { ListingFeedShellProps } from "./type";

export function ListingFeedShell({
  tab,
  filters,
  children,
  heading = "Azərbaycanda kirayə ev və otaq platforması",
  intro = "Bakı və Azərbaycanın bütün şəhərlərində kirayə ev, otaq və otaq yoldaşı elanları. Telefon nömrəsi paylaşılmır — əlaqə yalnız mesajla.",
}: ListingFeedShellProps) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl tracking-tight md:text-4xl">{heading}</h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{intro}</p>
      </header>
      <ListingFilters
        tab={tab}
        filters={filters}
        action={
          <Link
            href={newListingHref(tab)}
            className={cn(buttonVariants({ size: "lg" }), "w-full shrink-0 sm:w-auto")}
          >
            <Plus className="size-6" aria-hidden />
            Elan yerləşdir
          </Link>
        }
      />
      {children}
    </div>
  );
}

export { ListingFeedContent } from "./listingFeedContent";
export { ListingFeedGridSkeleton } from "./listingFeedGridSkeleton";
