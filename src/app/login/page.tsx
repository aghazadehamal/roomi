import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/queries";
import { LoginForm } from "@/features/auth/ui";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
      <div className="rounded-3xl bg-card p-8 shadow-sm ring-1 ring-border md:p-10">
        <h1 className="font-heading text-4xl tracking-tight">Xoş gəldin</h1>
        <p className="mt-3 text-muted-foreground">
          Elan yerləşdirmək və yazışmaq üçün hesab lazımdır.
        </p>
        <div className="mt-8">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </div>
  );
}
