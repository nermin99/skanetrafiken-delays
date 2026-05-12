import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DaySel, Granularity, MonthSel, WeekSel } from '../types'
import type { WeekRow } from '../lib/dates'
import { monthName, parseISODate } from '../lib/dates'
import { MonthPanel } from './MonthPanel'
import { WeekPanel } from './WeekPanel'
import { DayPanel } from './DayPanel'

function shiftMonth(m: MonthSel, delta: number): MonthSel {
  const d = new Date(m.year, m.month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

function ArrowButton({ onClick, dir }: { onClick: () => void; dir: 'prev' | 'next' }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous' : 'Next'}
      className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <Icon size={20} aria-hidden />
    </button>
  )
}

function Panel({
  title,
  caption,
  onPrev,
  onNext,
  children,
}: {
  title: string
  caption: string
  onPrev: () => void
  onNext: () => void
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <ArrowButton dir="prev" onClick={onPrev} />
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{title}</span>
        <ArrowButton dir="next" onClick={onNext} />
      </div>
      <div className="flex-1">{children}</div>
      <div className="border-t border-zinc-100 pt-3 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        {caption}
      </div>
    </div>
  )
}

export function DateNavigator({
  granularity,
  selMonth,
  selWeek,
  selDay,
  onSelectMonth,
  onSelectWeek,
  onSelectDay,
}: {
  granularity: Granularity
  selMonth: MonthSel
  selWeek: WeekSel
  selDay: DaySel
  onSelectMonth: (month: MonthSel) => void
  onSelectWeek: (week: WeekSel) => void
  onSelectDay: (day: DaySel) => void
}) {
  const [monthYear, setMonthYear] = useState(selMonth.year)
  const [weekMonth, setWeekMonth] = useState<MonthSel>({ year: selMonth.year, month: selMonth.month })
  const [dayMonth, setDayMonth] = useState<MonthSel>({ year: selMonth.year, month: selMonth.month })

  function pickMonth(month: number) {
    const sel = { year: monthYear, month }
    onSelectMonth(sel)
    setWeekMonth(sel)
    setDayMonth(sel)
  }

  function pickWeek(week: WeekRow) {
    onSelectWeek({ year: week.year, week: week.week })
    setDayMonth({ year: week.start.getFullYear(), month: week.start.getMonth() })
  }

  function pickDay(iso: string) {
    onSelectDay(iso)
    const d = parseISODate(iso)
    setDayMonth({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white sm:flex-row sm:divide-x sm:divide-y-0 dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900">
      <Panel
        title={String(monthYear)}
        caption="Select a month"
        onPrev={() => setMonthYear((y) => y - 1)}
        onNext={() => setMonthYear((y) => y + 1)}
      >
        <MonthPanel year={monthYear} selected={selMonth} onSelect={pickMonth} />
      </Panel>

      {granularity !== 'months' && (
        <Panel
          title={monthName(weekMonth.year, weekMonth.month)}
          caption="Select a week"
          onPrev={() => setWeekMonth((m) => shiftMonth(m, -1))}
          onNext={() => setWeekMonth((m) => shiftMonth(m, 1))}
        >
          <WeekPanel display={weekMonth} selected={selWeek} onSelect={pickWeek} />
        </Panel>
      )}

      {granularity === 'days' && (
        <Panel
          title={monthName(dayMonth.year, dayMonth.month)}
          caption="Select a day"
          onPrev={() => setDayMonth((m) => shiftMonth(m, -1))}
          onNext={() => setDayMonth((m) => shiftMonth(m, 1))}
        >
          <DayPanel display={dayMonth} selected={selDay} onSelect={pickDay} />
        </Panel>
      )}
    </div>
  )
}
