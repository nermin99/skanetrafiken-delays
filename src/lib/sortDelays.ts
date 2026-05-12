import type { DelayRecord, SortColumn, SortDir } from '../types'

/** Active sort, or `null` for the default ordering (date ascending, then time). */
export type SortState = { column: SortColumn; dir: SortDir } | null

function compareBy(a: DelayRecord, b: DelayRecord, column: SortColumn): number {
  switch (column) {
    case 'delayMinutes':
      return a.delayMinutes - b.delayMinutes
    case 'date':
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    case 'time':
      return a.time < b.time ? -1 : a.time > b.time ? 1 : 0
    default:
      return a[column].localeCompare(b[column])
  }
}

/** Next sort state when a column header is clicked: asc → desc → default (null). */
export function cycleSort(current: SortState, column: SortColumn): SortState {
  if (!current || current.column !== column) return { column, dir: 'asc' }
  if (current.dir === 'asc') return { column, dir: 'desc' }
  return null
}

/**
 * Stable sort of delay rows. Date→time is the canonical ordering: with no active sort
 * (or sorting by `date`) tiebreaks on `time`; sorting by any other column tiebreaks on
 * `date` then `time`.
 */
export function sortDelays(rows: readonly DelayRecord[], sort: SortState): DelayRecord[] {
  const column: SortColumn = sort?.column ?? 'date'
  const sign: number = sort?.dir === 'desc' ? -1 : 1
  const tiebreakers: SortColumn[] = column === 'date' ? ['time'] : column === 'time' ? ['date'] : ['date', 'time']
  return [...rows].sort((a, b) => {
    let cmp = compareBy(a, b, column)
    for (let i = 0; cmp === 0 && i < tiebreakers.length; i++) cmp = compareBy(a, b, tiebreakers[i])
    return cmp * sign
  })
}
