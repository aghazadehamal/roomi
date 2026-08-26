import Link from "next/link";
import { LogIn, MessageCircle, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { countUnreadMessages } from "@/features/chat/queries";
import { MessagesNav } from "@/features/chat/ui";
import { cn } from "@/lib/utils";

import { SignOutButton } from "./signOutButton";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unread = user ? await countUnreadMessages() : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
            </svg>
          </span>
          <span className="font-heading text-2xl tracking-tight">Roomi</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <MessagesNav initialUnread={unread} />
          ) : (
            <Link href="/messages" className={cn(buttonVariants({ variant: "ghost" }))}>
              <MessageCircle className="size-5" aria-hidden />
              Mesajlar
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className={cn(buttonVariants({ variant: "ghost" }))}>
                <User className="size-5" aria-hidden />
                Profil
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className={cn(buttonVariants(), "px-8")}>
              <LogIn className="size-5" aria-hidden />
              Giriş
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
