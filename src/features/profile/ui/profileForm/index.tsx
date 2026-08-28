"use client";

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
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Ad</span>
        <Input
          {...form.register("name")}
          autoComplete="name"
          autoFocus={defaultName.length === 0}
          placeholder="Məs: Aysel"
        />
      </label>
      {form.formState.errors.name ? (
        <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="w-fit"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Yadda saxlanır…" : "Yadda saxla"}
      </Button>
    </form>
  );
}
