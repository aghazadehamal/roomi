"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FeedTab } from "@/features/listings/model";
import {
  emptyListingFeedFilters,
  listingFeedFiltersActive,
  listingFeedHref,
  PRICE_FILTER_OPTIONS,
} from "@/features/listings/helpers/listingFeedFilters";
import { BAKU_DISTRICTS } from "@/features/listings/schema";
import { cn } from "@/lib/utils";

import type { ListingFiltersProps } from "./type";

const selectClass =
  "h-12 min-w-[10rem] flex-1 appearance-none rounded-xl border border-input bg-card px-6 py-3 pr-12 text-sm outline-none transition-colors sm:flex-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ListingFilters({ tab, filters, action }: ListingFiltersProps) {
  const router = useRouter();

  function update(next: Partial<typeof filters>) {
    router.push(listingFeedHref(tab, { ...filters, ...next }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid w-full grid-cols-2 rounded-full bg-secondary p-1.5 sm:max-w-md">
          <Link
            href={listingFeedHref(FeedTab.Offer, filters)}
            className={cn(
              "rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors sm:text-base",
              tab === FeedTab.Offer
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Ev / otaq verilir
          </Link>
          <Link
            href={listingFeedHref(FeedTab.Seek, filters)}
            className={cn(
              "rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors sm:text-base",
              tab === FeedTab.Seek
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Axtarıram
          </Link>
        </div>
        {action}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-12 items-center rounded-xl bg-card px-4 text-sm shadow-sm ring-1 ring-border">
          Bakı
        </span>
        <select
          className={selectClass}
          value={filters.district ?? ""}
          aria-label="Rayon"
          onChange={(event) => {
            update({ district: event.target.value || null });
          }}
        >
          <option value="">Bütün rayonlar</option>
          {BAKU_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.maxPrice ?? ""}
          aria-label={tab === FeedTab.Seek ? "Büdcə" : "Qiymət"}
          onChange={(event) => {
            const value = Number(event.target.value);
            update({ maxPrice: value || null });
          }}
        >
          <option value="">{tab === FeedTab.Seek ? "Büdcə: hamısı" : "Qiymət: hamısı"}</option>
          {PRICE_FILTER_OPTIONS.map((price) => (
            <option key={price} value={price}>
              {price} AZN-ə qədər
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.rooms ?? ""}
          aria-label="Otaq"
          onChange={(event) => {
            const value = Number(event.target.value);
            update({ rooms: value || null });
          }}
        >
          <option value="">Otaq: hamısı</option>
          <option value="1">1 otaq</option>
          <option value="2">2 otaq</option>
          <option value="3">3 otaq</option>
          <option value="4">4+ otaq</option>
        </select>
        {listingFeedFiltersActive(filters) ? (
          <Link
            href={listingFeedHref(tab, emptyListingFeedFilters())}
            className="inline-flex h-12 items-center px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Sıfırla
          </Link>
        ) : null}
      </div>
    </div>
  );
}
