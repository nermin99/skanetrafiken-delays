import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import type { DelayRecord, SortColumn, SortDir } from '../types'
import { formatDayLabel } from '../lib/dates'
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
  sortColumn,
  sortDir,
  onSort,
}: {
  column: SortColumn
  label: string
  sortColumn: SortColumn
  sortDir: SortDir
  onSort: (column: SortColumn) => void
}) {
  const active = sortColumn === column
  const Icon = !active ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown
  return (
    <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
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
  sortColumn,
  sortDir,
  onSort,
}: {
  rows: readonly DelayRecord[]
  sortColumn: SortColumn
  sortDir: SortDir
  onSort: (column: SortColumn) => void
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-zinc-200 dark:border-zinc-700">
          {COLUMNS.map((c) => (
            <SortHeader
              key={c.key}
              column={c.key}
              label={c.label}
              sortColumn={sortColumn}
              sortDir={sortDir}
              onSort={onSort}
            />
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
