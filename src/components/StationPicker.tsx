import { ArrowUpDown } from 'lucide-react'
import { STATIONS } from '../data/stations'
import type { Station } from '../types'
import { StationSelect } from './StationSelect'

export function StationPicker({
  stationA,
  stationB,
  onChangeA,
  onChangeB,
}: {
  stationA: Station
  stationB: Station
  onChangeA: (value: Station) => void
  onChangeB: (value: Station) => void
}) {
  const handleSwap = () => {
    onChangeA(stationB)
    onChangeB(stationA)
  }

  return (
    <div className="space-y-3">
      <div className="max-w-xl">
        <StationSelect
          label="Station A:"
          value={stationA}
          onChange={onChangeA}
          options={STATIONS}
          disabledOption={stationB}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="max-w-xl flex-1">
          <StationSelect
            label="Station B:"
            value={stationB}
            onChange={onChangeB}
            options={STATIONS}
            disabledOption={stationA}
          />
        </div>
        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap stations"
          title="Swap stations"
          className="rounded-full border border-zinc-300 bg-white p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowUpDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
