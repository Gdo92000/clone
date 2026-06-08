export function FxSkeletonHome() {
  return (
    <div className="animate-pulse space-y-10">
      <section className="text-center">
        <div className="mx-auto mt-2 h-8 w-72 rounded-full bg-surface-elevated" />
        <div className="mx-auto mt-3 h-5 w-64 rounded-full bg-surface-elevated" />
        <div className="mx-auto mt-5 h-12 max-w-xl rounded-full bg-surface-elevated" />
      </section>

      <section>
        <div className="mb-4 h-6 w-48 rounded bg-surface-elevated" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-elevated">
              <div className="h-14 w-14 rounded-2xl bg-surface-background" />
              <div className="h-3 w-16 rounded bg-surface-background" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 h-6 w-56 rounded bg-surface-elevated" />
        <div className="flex gap-4 -mx-4 px-4 pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-[320px] shrink-0 rounded-xl bg-surface-elevated overflow-hidden"
            >
              <div className="h-40 sm:h-48 bg-surface-background" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-5 w-3/4 rounded bg-surface-background" />
                <div className="h-4 w-1/2 rounded bg-surface-background" />
                <div className="h-4 w-2/3 rounded bg-surface-background" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 h-6 w-64 rounded bg-surface-elevated" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-elevated overflow-hidden">
              <div className="h-40 sm:h-48 bg-surface-background" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-5 w-3/4 rounded bg-surface-background" />
                <div className="h-4 w-1/2 rounded bg-surface-background" />
                <div className="h-4 w-2/3 rounded bg-surface-background" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
