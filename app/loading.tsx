export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mx-auto max-w-xl text-center space-y-4">
        <div className="mx-auto h-6 w-32 rounded-full bg-subtle dark:bg-dark-subtle" />
        <div className="mx-auto h-12 w-3/4 rounded-2xl bg-subtle dark:bg-dark-subtle" />
        <div className="mx-auto h-5 w-1/2 rounded-xl bg-subtle dark:bg-dark-subtle" />
      </div>

      {/* Content grid skeleton */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line dark:border-dark-line bg-white/60 dark:bg-dark-card/60 p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-subtle dark:bg-dark-subtle" />
              <div className="h-5 w-16 rounded-full bg-subtle dark:bg-dark-subtle" />
            </div>
            <div className="h-6 w-3/4 rounded-lg bg-subtle dark:bg-dark-subtle" />
            <div className="h-4 w-full rounded-md bg-subtle dark:bg-dark-subtle" />
            <div className="h-4 w-5/6 rounded-md bg-subtle dark:bg-dark-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
