"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { authErrorMessage } from "./authError";
import type { LoginFormProps } from "./type";

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const next = nextPath.startsWith("/") ? nextPath : "/";

    try {
      const path = mode === "signup" ? "/api/auth/sign-up" : "/api/auth/sign-in";
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? { email, password, name: name.trim() } : { email, password },
        ),
      });

      const payload: unknown = await response.json();
      const payloadError =
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : null;
      const needsEmailConfirm =
        typeof payload === "object" &&
        payload !== null &&
        "needsEmailConfirm" in payload &&
        payload.needsEmailConfirm === true;

      if (payloadError) {
        toast.error(authErrorMessage({ message: payloadError }));
        setPending(false);
        return;
      }

      if (needsEmailConfirm) {
        toast.info("Emailə təsdiq linki göndərdik. Məktubu aç, sonra giriş et.");
        setPending(false);
        return;
      }

      toast.success(mode === "signup" ? "Hesab yaradıldı" : "Daxil oldun");
      router.push(next);
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Əməliyyat alınmadı.";
      toast.error(authErrorMessage({ message }));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 rounded-full bg-secondary p-1">
        <button
          type="button"
          className={cn(
            "rounded-full py-2 text-sm font-medium",
            mode === "signin" ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
          onClick={() => {
            setMode("signin");
          }}
        >
          Giriş
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full py-2 text-sm font-medium",
            mode === "signup" ? "bg-card shadow-sm" : "text-muted-foreground",
          )}
          onClick={() => {
            setMode("signup");
          }}
        >
          Qeydiyyat
        </button>
      </div>
      {mode === "signup" ? (
        <Input
          name="name"
          type="text"
          placeholder="Ad"
          required
          minLength={2}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      ) : null}
      <Input name="email" type="email" placeholder="Email" required />
      <Input
        name="password"
        type="password"
        placeholder="Şifrə"
        required
        minLength={6}
      />
      <Button type="submit" size="lg" className="mt-1 w-full" disabled={pending}>
        {mode === "signup" ? "Hesab yarat" : "Daxil ol"}
      </Button>
    </form>
  );
}
