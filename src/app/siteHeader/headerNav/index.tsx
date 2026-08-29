import Link from "next/link";
import { LogIn, MessageCircle, User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/queries";
import { getMessagingContext } from "@/features/chat/queries";
import { MessagesNav } from "@/features/chat/ui";
import { cn } from "@/lib/utils";

import { SignOutButton } from "../signOutButton";

const navIconClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-10 sm:h-11 sm:w-auto sm:gap-2 sm:px-4",
);

export async function HeaderNav() {
  const user = await getCurrentUser();

  if (user) {
    const { conversationIds, unreadCount } = await getMessagingContext();

    return (
      <>
        <MessagesNav
          userId={user.id}
          conversationIds={conversationIds}
          initialUnread={unreadCount}
        />
        <Link href="/profile" aria-label="Profil" className={navIconClass}>
          <User className="size-5" aria-hidden />
          <span className="hidden sm:inline">Profil</span>
        </Link>
        <SignOutButton />
      </>
    );
  }

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
