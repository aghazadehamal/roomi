"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { archiveListing } from "@/features/listings/actions";
import { cn } from "@/lib/utils";

import type { ArchiveListingButtonProps } from "./type";

const ARCHIVE_DESCRIPTION =
  "Elan silinməyəcək, arxivə düşəcək. Söhbətlər qalacaq. Sonra yeni elan yerləşdirə bilərsən.";

const DELETE_DESCRIPTION =
  "Elan arxivə düşəcək və feed-də görünməyəcək. Söhbətlər qalacaq. Sonra yeni elan yerləşdirə bilərsən.";

export function ArchiveListingButton({
  listingId,
  mode = "archive",
}: ArchiveListingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isDelete = mode === "delete";

  async function onConfirm() {
    setPending(true);
    const result = await archiveListing(listingId);
    if (!result.ok) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    toast.success(isDelete ? "Elan silindi" : "Elan arxivə salındı");
    setOpen(false);
    router.push(isDelete ? "/profile" : "/");
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
          "w-full sm:w-auto",
          isDelete &&
            "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
        )}
        disabled={pending}
        onClick={() => {
          setOpen(true);
        }}
      >
        {isDelete ? (
          <Trash2 className="size-5" aria-hidden />
        ) : (
          <Archive className="size-5" aria-hidden />
        )}
        {pending
          ? isDelete
            ? "Silinir…"
            : "Arxivə salınır…"
          : isDelete
            ? "Elanı sil"
            : "Elanı arxivə sal"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isDelete ? "Elanı sil?" : "Elanı arxivə sal?"}
        description={isDelete ? DELETE_DESCRIPTION : ARCHIVE_DESCRIPTION}
        confirmLabel={
          pending ? (isDelete ? "Silinir…" : "Arxivə salınır…") : isDelete ? "Sil" : "Arxivə sal"
        }
        cancelLabel="Ləğv et"
        destructive={isDelete}
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
