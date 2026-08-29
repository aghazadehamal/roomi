"use client";

import { useRef, useState, type FormEvent } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reportContent } from "@/features/moderation/actions";
import {
  REPORT_REASON_LABELS,
  REPORT_REASONS,
  type ReportReason,
} from "@/features/moderation/schema";
import { cn } from "@/lib/utils";

import type { ReportFormProps } from "./type";

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClass =
  "min-h-24 w-full resize-y rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ReportForm({ listingId, conversationId }: ReportFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "").trim();

    setPending(true);
    const result = await reportContent({
      listingId,
      conversationId,
      reason,
      body: body.length > 0 ? body : undefined,
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Şikayət göndərildi");
    form.reset();
    setReason("spam");
    closeDialog();
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={openDialog}>
        <Flag className="size-4" aria-hidden />
        Şikayət et
      </Button>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed top-1/2 left-1/2 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2",
          "rounded-3xl border border-border bg-card p-0 shadow-xl backdrop:bg-black/40",
        )}
        onClose={() => {
          setReason("spam");
        }}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
          <div>
            <h2 className="font-heading text-2xl tracking-tight">Şikayət et</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Səbəbi seç. Lazım olsa qısa izah yaz.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Səbəb
            <select
              className={selectClass}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value as ReportReason);
              }}
              disabled={pending}
            >
              {REPORT_REASONS.map((value) => (
                <option key={value} value={value}>
                  {REPORT_REASON_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Əlavə qeyd (ixtiyari)
            <textarea
              name="body"
              className={textareaClass}
              placeholder="Nə baş verib?"
              maxLength={500}
              disabled={pending}
            />
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={pending} onClick={closeDialog}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Göndərilir…" : "Göndər"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
