import type { Station } from '../types'
import { Select } from './Select'

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
    <label className="relative flex">
      <span className="flex w-17 items-center rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {label}
      </span>
      <Select
        aria-label={label}
        value={value}
        onChange={onChange}
        options={options.map((option) => ({ value: option, label: option, disabled: option === disabledOption }))}
        className="flex-1"
        buttonClassName="h-full rounded-r-lg border border-zinc-300 bg-white px-4 py-2.5 text-left text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </label>
  )
}
