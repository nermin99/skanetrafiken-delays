import type { DelayQuery } from '../types'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DAY_MS = 24 * 60 * 60 * 1000

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** Local-date `yyyy-mm-dd` for a Date. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Parse a `yyyy-mm-dd` string into a local Date at midnight. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** ISO-8601 week number (1–53). */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Shift to the Thursday of this week — its calendar year is the ISO year.
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7))
  const week1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  return 1 + Math.round((d.getTime() - week1.getTime()) / DAY_MS / 7 - ((week1.getUTCDay() + 6) % 7) / 7)
}

/** ISO-8601 week-numbering year (may differ from the calendar year near year boundaries). */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7))
  return d.getUTCFullYear()
}

/** Monday (00:00 local) of the ISO week containing `date`. */
export function startOfISOWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayNum = (d.getDay() + 6) % 7 // Mon=0 … Sun=6
  d.setDate(d.getDate() - dayNum)
  return d
}

export function isoWeekKey(year: number, week: number): string {
  return `${year}-W${pad2(week)}`
}

/** Monday (00:00 local) of a given ISO week + ISO week-year. */
export function startOfISOWeekByNumber(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4) // Jan 4 is always in ISO week 1.
  const week1Monday = startOfISOWeek(jan4)
  const d = new Date(week1Monday)
  d.setDate(d.getDate() + (week - 1) * 7)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export type WeekRow = { week: number; year: number; start: Date; end: Date }

/** Ordered list of every ISO week that includes at least one day of the given month. */
export function weeksOverlappingMonth(year: number, month: number): WeekRow[] {
  const lastDay = new Date(year, month + 1, 0)
  const rows: WeekRow[] = []
  let cursor = startOfISOWeek(new Date(year, month, 1))
  while (cursor.getTime() <= lastDay.getTime()) {
    rows.push({
      week: getISOWeek(cursor),
      year: getISOWeekYear(cursor),
      start: new Date(cursor),
      end: addDays(cursor, 6),
    })
    cursor = addDays(cursor, 7)
  }
  return rows
}

/** 42 dates (6 rows × 7 cols, Monday-first) covering the given month plus its leading/trailing days. */
export function monthGrid(year: number, month: number): Date[] {
  const start = startOfISOWeek(new Date(year, month, 1))
  const days: Date[] = []
  for (let i = 0; i < 42; i++) days.push(addDays(start, i))
  return days
}

export function monthName(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

export function monthAbbr(month: number): string {
  return MONTH_ABBR[month]
}

/** e.g. `"Apr 28 – May 4"`. */
export function formatRange(start: Date, end: Date): string {
  return `${monthAbbr(start.getMonth())} ${start.getDate()} – ${monthAbbr(end.getMonth())} ${end.getDate()}`
}

/** e.g. `"May 14, 2026"` from a `yyyy-mm-dd` string. */
export function formatDayLabel(iso: string): string {
  const d = parseISODate(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function todaySelections() {
  const now = new Date()
  return {
    month: { year: now.getFullYear(), month: now.getMonth() },
    week: { year: getISOWeekYear(now), week: getISOWeek(now) },
    day: toISODate(now),
  }
}

/** Inclusive `yyyy-mm-dd` range covered by the active part of a query. */
export function rangeForQuery(query: DelayQuery): { start: string; end: string } {
  if (query.granularity === 'months') {
    const start = new Date(query.month.year, query.month.month, 1)
    const end = new Date(query.month.year, query.month.month + 1, 0)
    return { start: toISODate(start), end: toISODate(end) }
  }
  if (query.granularity === 'weeks') {
    const start = startOfISOWeekByNumber(query.week.year, query.week.week)
    return { start: toISODate(start), end: toISODate(addDays(start, 6)) }
  }
  return { start: query.day, end: query.day }
}

/** Human-readable description of the active period — used in the results header. */
export function describePeriod(query: DelayQuery): string {
  if (query.granularity === 'months') return monthName(query.month.year, query.month.month)
  if (query.granularity === 'weeks') {
    const start = startOfISOWeekByNumber(query.week.year, query.week.week)
    return `week ${query.week.week}, ${query.week.year} (${formatRange(start, addDays(start, 6))})`
  }
  return formatDayLabel(query.day)
}
