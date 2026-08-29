import Link from "next/link";
import { Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { newListingHref } from "@/features/listings/helpers/newListing";
import { cn } from "@/lib/utils";

import type { EmptyStateProps } from "./type";

export function EmptyState({ tab, filtered = false }: EmptyStateProps) {
  return (
    <section className="grid flex-1 overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border md:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col justify-center px-8 py-14 md:px-14 md:py-20">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Azərbaycan · kirayə
        </p>
        <h2 className="mt-3 font-heading text-4xl tracking-tight md:text-5xl">
          {filtered ? "Uyğun elan yoxdur" : "Hələ elan yoxdur"}
        </h2>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          {filtered
            ? "Filtrləri dəyiş, başqa şəhər və ya qiymət yoxla."
            : "Ev, otaq və yoldaş axtaranlar eyni yerdə."}
        </p>
        <Link
          href={newListingHref(tab)}
          className={cn(buttonVariants({ size: "lg" }), "mt-8 w-fit")}
        >
          <Plus className="size-6" aria-hidden />
          Elan yerləşdir
        </Link>
      </div>
      <div className="flex items-center justify-center bg-primary/10 px-8 py-16 text-primary">
        <svg
          viewBox="0 0 24 24"
          className="size-28 md:size-36"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden
        >
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      </div>
    </section>
  );
}
