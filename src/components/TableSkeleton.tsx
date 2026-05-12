export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse p-4" aria-hidden>
      <div className="flex gap-4 border-b border-zinc-100 pb-3 dark:border-zinc-800">
        {[28, 16, 20, 24, 24, 14].map((w, i) => (
          <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-700" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="space-y-3 pt-4">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-4">
            {[28, 16, 20, 24, 24].map((w, i) => (
              <div key={i} className="h-4 rounded bg-zinc-100 dark:bg-zinc-800" style={{ width: `${w}%` }} />
            ))}
            <div className="h-7 w-11 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
