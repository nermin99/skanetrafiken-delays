import type { MonthSel } from '../types'
import { monthAbbr } from '../lib/dates'

export function MonthPanel({
  year,
  selected,
  onSelect,
}: {
  year: number
  selected: MonthSel
  onSelect: (month: number) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 12 }, (_, month) => {
        const active = selected.year === year && selected.month === month
        return (
          <button
            key={month}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(month)}
            className={[
              'rounded-md px-2 py-2 text-sm transition-colors',
              active
                ? 'bg-brand font-medium text-white'
                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            {monthAbbr(month)}
          </button>
        )
      })}
    </div>
  )
}
