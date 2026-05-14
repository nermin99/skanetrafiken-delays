import { PAGE_SIZE_OPTIONS } from '../lib/pagination'
import { Select } from './Select'

const OPTIONS = PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))

export function PerPageSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <span>Per page</span>
      <Select
        aria-label="Entries per page"
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        options={OPTIONS}
        buttonClassName="rounded-md border border-zinc-300 bg-white py-1 pl-2.5 pr-2 tabular-nums transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      />
    </label>
  )
}
