"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/features/profile/actions";
import { profileFormSchema, type ProfileFormValues } from "@/features/profile/schema";

import type { ProfileFormProps } from "./type";

export function ProfileForm({ defaultName }: ProfileFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(defaultName.length === 0);
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: defaultName },
  });

  async function onSubmit(values: ProfileFormValues) {
    const result = await updateProfile(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Ad yadda saxlandı");
    setEditing(false);
    router.refresh();
  }

  function cancelEdit() {
    form.reset({ name: defaultName });
    setEditing(false);
  }

  if (!editing && defaultName.length > 0) {
    return (
      <div className="border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Adı dəyiş
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Ad</span>
          <Input
            {...form.register("name")}
            autoComplete="name"
            autoFocus={defaultName.length === 0 || editing}
            placeholder="Məs: Aysel"
          />
        </label>
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            size="lg"
            className="w-fit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting ? "Yadda saxlanır…" : "Yadda saxla"}
          </Button>
          {defaultName.length > 0 ? (
            <Button type="button" variant="ghost" size="lg" className="w-fit" onClick={cancelEdit}>
              Ləğv et
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
