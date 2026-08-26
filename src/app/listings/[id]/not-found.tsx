export default function ListingNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-3xl bg-card px-8 py-10 shadow-sm ring-1 ring-border">
      <h1 className="font-heading text-4xl tracking-tight">Elan tapılmadı</h1>
      <p className="text-muted-foreground">Bu elan yoxdur və ya arxivdədir.</p>
    </div>
  );
}
