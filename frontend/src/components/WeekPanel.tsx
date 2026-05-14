import type { MonthSel, WeekSel } from '../types'
import type { WeekRow } from '../lib/dates'
import { formatRange, isoWeekKey, isWeekInFuture, weeksOverlappingMonth } from '../lib/dates'

export function WeekPanel({
  display,
  selected,
  onSelect,
}: {
  display: MonthSel
  selected: WeekSel
  onSelect: (week: WeekRow) => void
}) {
  const weeks = weeksOverlappingMonth(display.year, display.month)
  return (
    <div className="flex h-full flex-col gap-1">
      {weeks.map((week) => {
        const active = selected.year === week.year && selected.week === week.week
        const disabled = isWeekInFuture(week.year, week.week)
        return (
          <button
            key={isoWeekKey(week.year, week.week)}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onSelect(week)}
            className={[
              'flex-1 rounded-md px-3 py-1.5 text-left text-sm transition-colors',
              disabled
                ? 'text-zinc-300 dark:text-zinc-600'
                : active
                  ? 'bg-brand font-medium text-white'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
            ].join(' ')}
          >
            W{week.week}. {formatRange(week.start, week.end)}
          </button>
        )
      })}
    </div>
  )
}
