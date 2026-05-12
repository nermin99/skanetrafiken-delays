import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Granularity } from '../types'

const OPTIONS: { value: Granularity; label: string; Icon: LucideIcon }[] = [
  { value: 'months', label: 'Months', Icon: Calendar },
  { value: 'weeks', label: 'Weeks', Icon: CalendarRange },
  { value: 'days', label: 'Days', Icon: CalendarDays },
]

export function ViewBy({
  granularity,
  onChange,
  onToday,
}: {
  granularity: Granularity
  onChange: (value: Granularity) => void
  onToday: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
        {OPTIONS.map(({ value, label, Icon }, i) => {
          const active = value === granularity
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(value)}
              className={[
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                i > 0 ? 'border-l border-zinc-300 dark:border-zinc-700' : '',
                active
                  ? 'bg-brand text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
              ].join(' ')}
            >
              <Icon size={16} aria-hidden />
              {label}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onToday}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        Today
      </button>
    </div>
  )
}
