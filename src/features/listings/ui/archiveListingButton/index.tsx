"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { archiveListing } from "@/features/listings/actions";

import type { ArchiveListingButtonProps } from "./type";

export function ArchiveListingButton({ listingId }: ArchiveListingButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onArchive() {
    const confirmed = window.confirm(
      "Elan silinməyəcək, arxivə düşəcək. Söhbətlər qalacaq. Sonra yeni elan yerləşdirə bilərsən.",
    );
    if (!confirmed) {
      return;
    }

    setPending(true);
    const result = await archiveListing(listingId);
    if (!result.ok) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success("Elan arxivə salındı");
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
    </div>
  );
}
