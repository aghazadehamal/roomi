"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ConfirmDialogProps } from "./type";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Təsdiq et",
  cancelLabel = "Ləğv et",
  destructive = false,
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function close() {
    if (!pending) {
      onOpenChange(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed top-1/2 left-1/2 w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2",
        "rounded-3xl border border-border bg-card p-0 shadow-xl backdrop:bg-black/40",
      )}
      onClose={() => {
        onOpenChange(false);
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="flex flex-col gap-5 p-6">
        <div>
          <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={pending} onClick={close}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
