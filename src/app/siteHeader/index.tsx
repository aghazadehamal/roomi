import Link from "next/link";
import { LogIn, MessageCircle, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { countUnreadMessages } from "@/features/chat/queries";
import { MessagesNav } from "@/features/chat/ui";
import { cn } from "@/lib/utils";

import { SignOutButton } from "./signOutButton";

const navIconClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-4",
);

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unread = user ? await countUnreadMessages() : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:px-10 md:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:size-11">
            <svg
              viewBox="0 0 24 24"
              className="size-4 sm:size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
            </svg>
          </span>
          <span className="font-heading truncate text-xl tracking-tight sm:text-2xl">
            kirayesin.az
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {user ? (
            <MessagesNav initialUnread={unread} />
          ) : (
            <Link href="/messages" aria-label="Mesajlar" className={navIconClass}>
              <MessageCircle className="size-5" aria-hidden />
              <span className="hidden sm:inline">Mesajlar</span>
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" aria-label="Profil" className={navIconClass}>
                <User className="size-5" aria-hidden />
                <span className="hidden sm:inline">Profil</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
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
          )}
        </nav>
      </div>
    </header>
  );
}
