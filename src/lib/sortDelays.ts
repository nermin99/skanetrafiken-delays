import type { DelayRecord, SortColumn, SortDir } from '../types'

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

/**
 * Stable sort of delay rows. Date→time is the canonical ordering: sorting by `date`
 * tiebreaks on `time`; sorting by any other column tiebreaks on `date` then `time`.
 */
export function sortDelays(rows: readonly DelayRecord[], column: SortColumn, dir: SortDir): DelayRecord[] {
  const tiebreakers: SortColumn[] = column === 'date' ? ['time'] : column === 'time' ? ['date'] : ['date', 'time']
  const sign = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    let cmp = compareBy(a, b, column)
    for (let i = 0; cmp === 0 && i < tiebreakers.length; i++) cmp = compareBy(a, b, tiebreakers[i])
    return cmp * sign
  })
}
