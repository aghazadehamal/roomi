"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { archiveListing, deleteListing } from "@/features/listings/actions";
import { cn } from "@/lib/utils";

import type { ArchiveListingButtonProps } from "./type";

const ARCHIVE_DESCRIPTION =
  "Elan feed-də görünməyəcək, amma profilində qalacaq. Sonra yenidən aktiv edə bilərsən. Söhbətlər qalacaq.";

const DELETE_DESCRIPTION =
  "Elan tamamilə silinəcək. Geri qaytarmaq olmaz. Bu elandakı söhbətlər də silinəcək.";

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
    const result = isDelete
      ? await deleteListing(listingId)
      : await archiveListing(listingId);
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
