"use client";

import { useState, type MouseEvent } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { saveListing, unsaveListing } from "@/features/listings/actions";
import { cn } from "@/lib/utils";

import type { SaveListingButtonProps } from "./type";

export function SaveListingButton({
  listingId,
  initialSaved,
  className,
  iconOnly = false,
}: SaveListingButtonProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function onToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    setPending(true);
    const result = saved ? await unsaveListing(listingId) : await saveListing(listingId);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setSaved(!saved);
    toast.success(saved ? "Seçilmişdən çıxarıldı" : "Seçilmişlərə əlavə olundu");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={iconOnly ? "outline" : saved ? "default" : "outline"}
      size={iconOnly ? "icon-sm" : "sm"}
      className={cn(
        iconOnly &&
          "rounded-full bg-card/95 shadow-sm ring-1 ring-border/70 backdrop-blur-sm hover:bg-card",
        iconOnly &&
          saved &&
          "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90",
        !iconOnly && saved && "bg-primary text-primary-foreground",
        className,
      )}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Seçilmişdən çıxart" : "Seçilmişlərə əlavə et"}
      onClick={(event) => {
        void onToggle(event);
      }}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} aria-hidden />
      {iconOnly ? null : saved ? "Seçilmişdən çıxart" : "Seçilmişlərə əlavə et"}
    </Button>
  );
}
