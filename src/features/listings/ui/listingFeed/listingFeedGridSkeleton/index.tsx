export function ListingFeedGridSkeleton() {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="aspect-[4/3] rounded-3xl bg-muted" />
      ))}
    </div>
  );
}
