"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { startConversation } from "@/features/chat/actions";

import type { StartChatButtonProps } from "./type";

export function StartChatButton({ listingId }: StartChatButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onStart() {
    setError(null);
    setPending(true);
    const result = await startConversation(listingId);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(`/messages/${result.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" size="lg" className="w-fit" disabled={pending} onClick={onStart}>
        {pending ? "Açılır…" : "Mesaj yaz"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
