"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { restoreListing } from "@/features/listings/actions";

import type { RestoreListingButtonProps } from "./type";

export function RestoreListingButton({ listingId }: RestoreListingButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onRestore() {
    setError(null);
    setPending(true);
    const result = await restoreListing(listingId);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(`/listings/${result.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        disabled={pending}
        onClick={() => {
          void onRestore();
        }}
      >
        {pending ? "Aktiv edilir…" : "Yenidən aktiv et"}
      </Button>
      <p className="max-w-md text-sm text-muted-foreground">
        Aktiv elanın varsa, əvvəlcə onu arxivə sal. Aktiv olanda 21 gün yenidən başlayır.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
