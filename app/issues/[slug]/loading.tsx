export default function IssueLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-8 sm:py-16 animate-pulse">
      {/* Top navigation skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-5 w-24 rounded-md bg-subtle dark:bg-dark-subtle" />
        <div className="h-6 w-16 rounded-full bg-subtle dark:bg-dark-subtle" />
      </div>

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-24 rounded-pill bg-subtle dark:bg-dark-subtle" />
        <div className="h-10 w-4/5 rounded-xl bg-subtle dark:bg-dark-subtle" />
        <div className="h-6 w-full rounded-lg bg-subtle dark:bg-dark-subtle" />
        <div className="h-6 w-3/4 rounded-lg bg-subtle dark:bg-dark-subtle" />
      </div>

      {/* Symptoms card skeleton */}
      <div className="mt-10 rounded-2xl border border-line dark:border-dark-line bg-subtle/70 dark:bg-dark-subtle/70 p-5 space-y-3">
        <div className="h-4 w-36 rounded bg-line dark:bg-dark-line" />
        <div className="h-4 w-5/6 rounded bg-line dark:bg-dark-line" />
        <div className="h-4 w-2/3 rounded bg-line dark:bg-dark-line" />
      </div>

      {/* Checklist skeleton */}
      <div className="mt-12 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-line dark:border-dark-line">
          <div className="h-4 w-40 rounded bg-subtle dark:bg-dark-subtle" />
          <div className="h-4 w-28 rounded bg-subtle dark:bg-dark-subtle" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line dark:border-dark-line bg-white/60 dark:bg-dark-card/60 p-5 space-y-2 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-subtle dark:bg-dark-subtle" />
              <div className="h-5 w-1/2 rounded-lg bg-subtle dark:bg-dark-subtle" />
            </div>
            <div className="ml-9 h-4 w-4/5 rounded bg-subtle dark:bg-dark-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
