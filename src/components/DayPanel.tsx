import type { DaySel, MonthSel } from '../types'
import { isDayInFuture, monthGrid, toISODate } from '../lib/dates'

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function DayPanel({
  display,
  selected,
  onSelect,
}: {
  display: MonthSel
  selected: DaySel
  onSelect: (iso: string) => void
}) {
  const todayIso = toISODate(new Date())
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {monthGrid(display.year, display.month).map((date) => {
          const iso = toISODate(date)
          const inMonth = date.getMonth() === display.month
          const isSelected = iso === selected
          const isToday = iso === todayIso
          const disabled = isDayInFuture(iso)
          return (
            <button
              key={iso}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              className={[
                'h-9 rounded-md text-sm transition-colors',
                disabled
                  ? 'text-zinc-300 dark:text-zinc-700'
                  : isSelected
                    ? 'bg-brand font-medium text-white'
                    : inMonth
                      ? 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                      : 'text-zinc-300 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:bg-zinc-800',
                isToday && !isSelected ? 'ring-1 ring-brand ring-inset' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
