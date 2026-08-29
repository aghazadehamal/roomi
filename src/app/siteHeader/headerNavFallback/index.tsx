import Link from "next/link";
import { LogIn, MessageCircle, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navIconClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-4",
);

export function HeaderNavFallback() {
  return (
    <>
      <Link href="/messages" aria-label="Mesajlar" className={navIconClass}>
        <MessageCircle className="size-5" aria-hidden />
        <span className="hidden sm:inline">Mesajlar</span>
      </Link>
      <Link
        href="/login"
        aria-label="Giriş"
        className={cn(
          buttonVariants({ size: "icon" }),
          "size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-6",
        )}
      >
        <LogIn className="size-5" aria-hidden />
        <span className="hidden sm:inline">Giriş</span>
      </Link>
    </>
  );
}
