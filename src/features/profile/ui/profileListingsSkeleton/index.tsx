export function ProfileListingsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="space-y-3">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-24 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
