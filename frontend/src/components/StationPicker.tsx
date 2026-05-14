import { ArrowUpDown } from 'lucide-react'
import { STATIONS } from '../data/stations'
import type { Station } from '../types'
import { StationSelect } from './StationSelect'

export function StationPicker({
  stationA,
  stationB,
  ignoreDirection,
  includeIntermediate,
  onChangeA,
  onChangeB,
  onChangeIgnoreDirection,
  onChangeIncludeIntermediate,
}: {
  stationA: Station
  stationB: Station
  ignoreDirection: boolean
  includeIntermediate: boolean
  onChangeA: (value: Station) => void
  onChangeB: (value: Station) => void
  onChangeIgnoreDirection: (value: boolean) => void
  onChangeIncludeIntermediate: (value: boolean) => void
}) {
  const handleSwap = () => {
    onChangeA(stationB)
    onChangeB(stationA)
  }

  return (
    <div className="space-y-3">
      <div className="max-w-xl">
        <StationSelect
          label="From:"
          value={stationA}
          onChange={onChangeA}
          options={STATIONS}
          disabledOption={stationB}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="max-w-xl flex-1">
          <StationSelect
            label="To:"
            value={stationB}
            onChange={onChangeB}
            options={STATIONS}
            disabledOption={stationA}
          />
        </div>
        {!ignoreDirection && (
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap stations"
            title="Swap stations"
            className="rounded-full border border-zinc-300 bg-white p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowUpDown className="h-5 w-5" />
          </button>
        )}
      </div>
      <label className="flex max-w-xl cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={ignoreDirection}
          onChange={(e) => onChangeIgnoreDirection(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 accent-brand dark:border-zinc-600"
        />
        Ignore direction (show delays in either direction)
      </label>
      <label className="flex max-w-xl cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={includeIntermediate}
          onChange={(e) => onChangeIncludeIntermediate(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 accent-brand dark:border-zinc-600"
        />
        Include intermediate stations (show delays between stations along the route)
      </label>
    </div>
  )
}
