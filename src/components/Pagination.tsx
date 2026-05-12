import { ChevronLeft, ChevronRight } from 'lucide-react'

function StepButton({ onClick, disabled, dir }: { onClick: () => void; disabled: boolean; dir: 'prev' | 'next' }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      className="rounded-md border border-zinc-300 p-1 text-zinc-600 transition-colors enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:enabled:hover:bg-zinc-800"
    >
      <Icon size={16} aria-hidden />
    </button>
  )
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number
  pages: number
  onChange: (page: number) => void
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <StepButton dir="prev" disabled={page <= 1} onClick={() => onChange(page - 1)} />
      <span className="tabular-nums">
        {page} of {pages}
      </span>
      <StepButton dir="next" disabled={page >= pages} onClick={() => onChange(page + 1)} />
    </div>
  )
}
