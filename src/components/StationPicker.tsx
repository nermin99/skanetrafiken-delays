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
  return (
    <div className="max-w-xl space-y-3">
      <StationSelect
        label="Station A:"
        value={stationA}
        onChange={onChangeA}
        options={STATIONS}
        disabledOption={stationB}
      />
      <StationSelect
        label="Station B:"
        value={stationB}
        onChange={onChangeB}
        options={STATIONS}
        disabledOption={stationA}
      />
    </div>
  )
}
