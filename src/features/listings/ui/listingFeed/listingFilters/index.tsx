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
import {
  AZ_CITIES,
  BAKU_DISTRICTS,
  BAKU_METRO_STATIONS,
  isBakuCity,
} from "@/features/listings/model/locations";
import { RENTAL_TERM_LABELS } from "@/features/listings/model";
import { cn } from "@/lib/utils";

import type { ListingFiltersProps } from "./type";

const selectClass =
  "h-12 min-w-[10rem] flex-1 appearance-none rounded-xl border border-input bg-card px-6 py-3 pr-12 text-sm outline-none transition-colors sm:flex-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ListingFilters({ tab, filters, action }: ListingFiltersProps) {
  const router = useRouter();
  const showBakuLocationFilters = !filters.city || isBakuCity(filters.city);
  const genderLabel = tab === FeedTab.Seek ? "Kim" : "Kimə";

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
        <select
          className={selectClass}
          value={filters.city ?? ""}
          aria-label="Şəhər"
          onChange={(event) => {
            const city = event.target.value || null;
            const leaveBaku = Boolean(city && !isBakuCity(city));
            update({
              city,
              district: leaveBaku ? null : filters.district,
              metro: leaveBaku ? null : filters.metro,
            });
          }}
        >
          <option value="">Bütün şəhərlər</option>
          {AZ_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {showBakuLocationFilters ? (
          <>
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
              value={filters.metro ?? ""}
              aria-label="Metro"
              onChange={(event) => {
                update({ metro: event.target.value || null });
              }}
            >
              <option value="">Bütün metrolar</option>
              {BAKU_METRO_STATIONS.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </>
        ) : null}
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
        <select
          className={selectClass}
          value={filters.housingKind ?? ""}
          aria-label="Ev növü"
          onChange={(event) => {
            const value = event.target.value;
            update({
              housingKind: value === "apartment" || value === "house" ? value : null,
            });
          }}
        >
          <option value="">Ev: hamısı</option>
          <option value="apartment">Bina evi</option>
          <option value="house">Həyət evi</option>
        </select>
        <select
          className={selectClass}
          value={filters.genderPref ?? ""}
          aria-label={genderLabel}
          onChange={(event) => {
            const value = event.target.value;
            update({
              genderPref:
                value === "female" || value === "male" || value === "family"
                  ? value
                  : null,
            });
          }}
        >
          <option value="">{genderLabel}: hamısı</option>
          {tab === FeedTab.Seek ? (
            <>
              <option value="female">Qadın</option>
              <option value="male">Kişi</option>
              <option value="family">Ailə</option>
            </>
          ) : (
            <>
              <option value="female">Yalnız qadın</option>
              <option value="male">Yalnız kişi</option>
              <option value="family">Ailə</option>
            </>
          )}
        </select>
        <select
          className={selectClass}
          value={filters.rentalTerm ?? ""}
          aria-label="Müddət"
          onChange={(event) => {
            const value = event.target.value;
            update({
              rentalTerm:
                value === "daily" || value === "long_term" ? value : null,
            });
          }}
        >
          <option value="">Müddət: hamısı</option>
          <option value="long_term">{RENTAL_TERM_LABELS.long_term}</option>
          <option value="daily">{RENTAL_TERM_LABELS.daily}</option>
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
