"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startConversation } from "@/features/chat/actions";

import type { StartChatButtonProps } from "./type";

export function StartChatButton({ listingId }: StartChatButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onStart() {
    setPending(true);
    const result = await startConversation(listingId);
    if (!result.ok) {
      toast.error(result.error);
      setPending(false);
      return;
    }
    router.push(`/messages/${result.id}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" size="lg" className="w-fit" disabled={pending} onClick={onStart}>
        <MessageCircle className="size-5" aria-hidden />
        {pending ? "Açılır…" : "Mesaj yaz"}
      </Button>
    </div>
  );
}
