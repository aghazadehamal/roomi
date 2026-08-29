type RouteLoadingProps = {
  variant?: "default" | "detail" | "profile" | "messages";
};

export function RouteLoading({ variant = "default" }: RouteLoadingProps) {
  if (variant === "detail") {
    return (
      <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-6">
        <div className="aspect-[16/9] rounded-3xl bg-muted" />
        <div className="rounded-3xl bg-muted p-8 ring-1 ring-border">
          <div className="h-4 w-32 rounded-lg bg-secondary" />
          <div className="mt-4 h-10 w-2/3 rounded-lg bg-secondary" />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-2xl bg-secondary" />
            <div className="h-16 rounded-2xl bg-secondary" />
            <div className="h-16 rounded-2xl bg-secondary" />
            <div className="h-16 rounded-2xl bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-8">
        <div className="rounded-3xl bg-muted p-10 ring-1 ring-border">
          <div className="flex gap-5">
            <div className="size-16 rounded-2xl bg-secondary" />
            <div className="flex flex-1 flex-col gap-3">
              <div className="h-10 w-48 rounded-lg bg-secondary" />
              <div className="h-4 w-64 rounded-lg bg-secondary" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-8 w-32 rounded-lg bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (variant === "messages") {
    return (
      <div className="mx-auto flex w-full max-w-2xl animate-pulse flex-col gap-6">
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="overflow-hidden rounded-3xl bg-muted ring-1 ring-border">
          <div className="h-20 border-b border-border/70 bg-secondary/40" />
          <div className="h-20 border-b border-border/70 bg-secondary/40" />
          <div className="h-20 bg-secondary/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="space-y-3">
        <div className="h-10 w-2/3 max-w-lg rounded-xl bg-muted" />
        <div className="h-5 w-full max-w-2xl rounded-lg bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-11 w-28 rounded-full bg-muted" />
        <div className="h-11 w-28 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
