import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import type { DelayRecord, SortColumn } from '../types'
import { formatDayLabel } from '../lib/dates'
import type { SortState } from '../lib/sortDelays'
import { DelayBadge } from './DelayBadge'

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'trainNumber', label: 'Train #' },
  { key: 'origin', label: 'Origin' },
  { key: 'destination', label: 'Destination' },
  { key: 'delayMinutes', label: 'Delay' },
]

function SortHeader({
  column,
  label,
  sort,
  onSort,
}: {
  column: SortColumn
  label: string
  sort: SortState
  onSort: (column: SortColumn) => void
}) {
  const active = sort?.column === column
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ChevronUp : ChevronDown
  return (
    <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className="inline-flex items-center gap-1 transition-colors hover:text-zinc-800 dark:hover:text-zinc-100"
      >
        <span>{label}</span>
        <Icon size={14} className={active ? 'text-brand' : 'text-zinc-400 dark:text-zinc-600'} aria-hidden />
      </button>
    </th>
  )
}

export function DelaysTable({
  rows,
  sort,
  onSort,
}: {
  rows: readonly DelayRecord[]
  sort: SortState
  onSort: (column: SortColumn) => void
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-zinc-200 dark:border-zinc-700">
          {COLUMNS.map((c) => (
            <SortHeader key={c.key} column={c.key} label={c.label} sort={sort} onSort={onSort} />
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
          >
            <td className="px-4 py-3 whitespace-nowrap text-zinc-700 dark:text-zinc-200">{formatDayLabel(row.date)}</td>
            <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-200">{row.time}</td>
            <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-200">{row.trainNumber}</td>
            <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.origin}</td>
            <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{row.destination}</td>
            <td className="px-4 py-3">
              <DelayBadge minutes={row.delayMinutes} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
