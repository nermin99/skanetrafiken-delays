import type { MonthSel } from '../types'
import { isMonthInFuture, monthAbbr } from '../lib/dates'

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
    <div className="flex h-full items-center">
      <div className="grid w-full grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, month) => {
          const active = selected.year === year && selected.month === month
          const disabled = isMonthInFuture(year, month)
          return (
            <button
              key={month}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onSelect(month)}
              className={[
                'h-14 rounded-md text-sm transition-colors',
                disabled
                  ? 'text-zinc-300 dark:text-zinc-600'
                  : active
                    ? 'bg-brand font-medium text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
              ].join(' ')}
            >
              {monthAbbr(month)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
