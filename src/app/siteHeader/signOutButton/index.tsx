"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      aria-label="Çıxış"
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-4",
      )}
    >
      <LogOut className="size-5" aria-hidden />
      <span className="hidden sm:inline">Çıxış</span>
    </button>
  );
}
