import { cn } from "@/lib/utils";

import { BlockButton } from "../blockButton";
import { ReportForm } from "../reportForm";

import type { ModerationActionsProps } from "./type";

export function ModerationActions({
  targetUserId,
  listingId,
  conversationId,
  blockedByMe = false,
  className,
}: ModerationActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl bg-secondary/60 px-4 py-3 ring-1 ring-border/60",
        className,
      )}
    >
      <p className="w-full text-sm text-muted-foreground sm:w-auto sm:flex-1">
        Problem var?
      </p>
      <ReportForm listingId={listingId} conversationId={conversationId} />
      <BlockButton blockedUserId={targetUserId} blockedByMe={blockedByMe} />
    </div>
  );
}
