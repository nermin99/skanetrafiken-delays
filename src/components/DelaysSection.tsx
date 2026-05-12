import { CalendarClock } from 'lucide-react'
import type { DelayQuery, DelayRecord, SortColumn, SortDir } from '../types'
import { describePeriod } from '../lib/dates'
import { DelaysTable } from './DelaysTable'
import { Pagination } from './Pagination'
import { TableSkeleton } from './TableSkeleton'

export const PAGE_SIZE = 5

export function DelaysSection({
  query,
  rows,
  loading,
  page,
  onPageChange,
  sortColumn,
  sortDir,
  onSort,
}: {
  query: DelayQuery
  rows: readonly DelayRecord[]
  loading: boolean
  page: number
  onPageChange: (page: number) => void
  sortColumn: SortColumn
  sortDir: SortDir
  onSort: (column: SortColumn) => void
}) {
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasRows = !loading && rows.length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <CalendarClock size={16} className="text-brand" aria-hidden />
          Showing delays for {describePeriod(query)}
        </div>
        {hasRows && (
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              {rows.length} {rows.length === 1 ? 'delay' : 'delays'} found
            </span>
            <Pagination page={safePage} pages={pages} onChange={onPageChange} />
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <p className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">
          There are no delays for the selected time period.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <DelaysTable rows={pageRows} sortColumn={sortColumn} sortDir={sortDir} onSort={onSort} />
          </div>
          <div className="flex justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <Pagination page={safePage} pages={pages} onChange={onPageChange} />
          </div>
        </>
      )}
    </div>
  )
}
