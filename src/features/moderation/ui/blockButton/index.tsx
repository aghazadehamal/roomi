"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { blockUser, unblockUser } from "@/features/moderation/actions";

import type { BlockButtonProps } from "./type";

export function BlockButton({
  blockedUserId,
  blockedByMe = false,
  onBlocked,
}: BlockButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onBlock() {
    const confirmed = window.confirm(
      "Bu istifadəçini bloklayacaqsan. Mesajlaşma dayanacaq.",
    );
    if (!confirmed) {
      return;
    }

    setPending(true);
    const result = await blockUser(blockedUserId);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("İstifadəçi bloklandı");
    onBlocked?.();
    router.refresh();
  }

  async function onUnblock() {
    const confirmed = window.confirm(
      "Bloku götürəcəksən. Mesajlaşma yenidən açılacaq.",
    );
    if (!confirmed) {
      return;
    }

    setPending(true);
    const result = await unblockUser(blockedUserId);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Blok götürüldü");
    onBlocked?.();
    router.refresh();
  }

  if (blockedByMe) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          void onUnblock();
        }}
      >
        <Ban className="size-4" aria-hidden />
        {pending ? "Gözlə…" : "Bloku götür"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        void onBlock();
      }}
    >
      <Ban className="size-4" aria-hidden />
      {pending ? "Bloklanır…" : "Blokla"}
    </Button>
  );
}
