import Link from "next/link";
import { Suspense } from "react";

import { HeaderNav } from "./headerNav";
import { HeaderNavFallback } from "./headerNavFallback";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:size-12">
            <svg
              viewBox="0 0 24 24"
              className="size-7 sm:size-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
            </svg>
          </span>
          <span className="font-heading truncate text-xl tracking-tight sm:text-2xl">
            kirayesin.az
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Suspense fallback={<HeaderNavFallback />}>
            <HeaderNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
