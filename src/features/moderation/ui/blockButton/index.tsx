"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { blockUser, unblockUser } from "@/features/moderation/actions";

import type { BlockButtonProps } from "./type";

type BlockIntent = "block" | "unblock";

const COPY: Record<
  BlockIntent,
  { title: string; description: string; confirm: string; pending: string; success: string }
> = {
  block: {
    title: "İstifadəçini blokla?",
    description: "Bu istifadəçini bloklayacaqsan. Mesajlaşma dayanacaq.",
    confirm: "Blokla",
    pending: "Bloklanır…",
    success: "İstifadəçi bloklandı",
  },
  unblock: {
    title: "Bloku götür?",
    description: "Bloku götürəcəksən. Mesajlaşma yenidən açılacaq.",
    confirm: "Bloku götür",
    pending: "Gözlə…",
    success: "Blok götürüldü",
  },
};

export function BlockButton({
  blockedUserId,
  blockedByMe = false,
  onBlocked,
}: BlockButtonProps) {
  const router = useRouter();
  const [intent, setIntent] = useState<BlockIntent | null>(null);
  const [pending, setPending] = useState(false);
  const copy = intent ? COPY[intent] : null;

  async function onConfirm() {
    if (!intent) {
      return;
    }

    setPending(true);
    const result =
      intent === "block" ? await blockUser(blockedUserId) : await unblockUser(blockedUserId);
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(COPY[intent].success);
    setIntent(null);
    onBlocked?.();
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          setIntent(blockedByMe ? "unblock" : "block");
        }}
      >
        <Ban className="size-4" aria-hidden />
        {pending ? "Gözlə…" : blockedByMe ? "Bloku götür" : "Blokla"}
      </Button>
      {copy ? (
        <ConfirmDialog
          open={intent !== null}
          onOpenChange={(open) => {
            if (!open && !pending) {
              setIntent(null);
            }
          }}
          title={copy.title}
          description={copy.description}
          confirmLabel={pending ? copy.pending : copy.confirm}
          cancelLabel="Ləğv et"
          destructive={intent === "block"}
          pending={pending}
          onConfirm={onConfirm}
        />
      ) : null}
    </>
  );
}
