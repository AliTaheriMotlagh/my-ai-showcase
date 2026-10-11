export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[600px] space-y-6 px-3 py-6" aria-busy="true" aria-label="Loading">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-elevated" />
            <div className="h-3 w-40 rounded bg-elevated" />
          </div>
          <div className="aspect-[4/5] rounded-2xl bg-elevated" />
          <div className="h-3 w-2/3 rounded bg-elevated" />
        </div>
      ))}
    </div>
  );
}
