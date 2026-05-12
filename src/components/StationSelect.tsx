import { ChevronDown } from 'lucide-react'
import type { Station } from '../types'

export function StationSelect({
  label,
  value,
  onChange,
  options,
  disabledOption,
}: {
  label: string
  value: Station
  onChange: (value: Station) => void
  options: readonly Station[]
  disabledOption?: Station
}) {
  return (
    <label className="flex items-stretch overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <span className="flex items-center border-r border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {label}
      </span>
      <span className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Station)}
          className="w-full appearance-none bg-transparent px-4 py-2.5 pr-10 text-zinc-900 focus:outline-none dark:text-zinc-100"
        >
          {options.map((option) => (
            <option key={option} value={option} disabled={option === disabledOption}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
        />
      </span>
    </label>
  )
}
