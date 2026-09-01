import Link from "next/link";

import {
  POPULAR_KIRAYE_CITIES,
  POPULAR_KIRAYE_DISTRICTS,
  cityKirayePath,
  districtKirayePath,
} from "@/features/listings/helpers/listingLocationSeo";

export function ListingSeoLinks() {
  return (
    <section className="border-t border-border/70 pt-8" aria-label="Kirayə elanları üzrə şəhər və rayonlar">
      <h2 className="font-heading text-xl tracking-tight">Şəhər və rayon üzrə kirayə</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Bakı rayonları və Azərbaycan şəhərləri üzrə kirayə ev, otaq və otaq yoldaşı elanları.
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Şəhərlər
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {POPULAR_KIRAYE_CITIES.map((city) => (
              <li key={city}>
                <Link
                  href={cityKirayePath(city)}
                  className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground hover:ring-primary"
                >
                  {city} kirayə
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Bakı rayonları
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {POPULAR_KIRAYE_DISTRICTS.map((district) => (
              <li key={district}>
                <Link
                  href={districtKirayePath(district)}
                  className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-primary hover:text-primary-foreground hover:ring-primary"
                >
                  {district}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
