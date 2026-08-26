"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { archiveListing } from "@/features/listings/actions";

import type { ArchiveListingButtonProps } from "./type";

export function ArchiveListingButton({ listingId }: ArchiveListingButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onArchive() {
    const confirmed = window.confirm(
      "Elan silinməyəcək, arxivə düşəcək. Söhbətlər qalacaq. Sonra yeni elan yerləşdirə bilərsən.",
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    setPending(true);
    const result = await archiveListing(listingId);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push("/");
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
          void onArchive();
        }}
      >
        {pending ? "Arxivə salınır…" : "Elanı arxivə sal"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
