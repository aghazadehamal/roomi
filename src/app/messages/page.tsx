import { Suspense } from "react";

import {
  MessagesList,
  MessagesListFallback,
  MessagesSummary,
  MessagesSummaryFallback,
} from "@/features/chat/ui/messagesContent";

export default function MessagesPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">Mesajlar</h1>
        <Suspense fallback={<MessagesSummaryFallback />}>
          <MessagesSummary />
        </Suspense>
      </div>
      <Suspense fallback={<MessagesListFallback />}>
        <MessagesList />
      </Suspense>
    </div>
  );
}
