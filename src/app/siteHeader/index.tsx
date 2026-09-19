import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { HeaderNav } from "./headerNav";
import { HeaderNavFallback } from "./headerNavFallback";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/brand-mark.png"
            alt="kirayesin.az"
            width={48}
            height={48}
            className="size-10 shrink-0 rounded-2xl sm:size-12"
            priority
          />
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
