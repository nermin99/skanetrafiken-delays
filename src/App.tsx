import { useState } from 'react'
import type { DelayQuery, Granularity, SortColumn, Station } from './types'
import { isCurrentPeriod, todaySelections } from './lib/dates'
import { DEFAULT_PAGE_SIZE } from './lib/pagination'
import { cycleSort, sortDelays, type SortState } from './lib/sortDelays'
import { useDelays } from './hooks/useDelays'
import { Header } from './components/Header'
import { Section } from './components/Section'
import { StationPicker } from './components/StationPicker'
import { ViewBy } from './components/ViewBy'
import { DateNavigator } from './components/DateNavigator'
import { DelaysSection } from './components/DelaysSection'

const initial = todaySelections()

function App() {
  const [stationA, setStationA] = useState<Station>('Burlöv')
  const [stationB, setStationB] = useState<Station>('Köpenhamn Østerport')
  const [ignoreDirection, setIgnoreDirection] = useState(true)
  const [includeIntermediate, setIncludeIntermediate] = useState(true)
  const [granularity, setGranularity] = useState<Granularity>('days')
  const [selMonth, setSelMonth] = useState(initial.month)
  const [selWeek, setSelWeek] = useState(initial.week)
  const [selDay, setSelDay] = useState(initial.day)
  const [sort, setSort] = useState<SortState>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [navKey, setNavKey] = useState(0)

  // Only the picker matching the active granularity feeds the query — flipping through the
  // coarser pickers (e.g. browsing months/weeks while viewing by day) must not refetch the
  // table. The inactive fields are pinned to a constant so they never perturb the query key.
  const query: DelayQuery = {
    stationA,
    stationB,
    ignoreDirection,
    includeIntermediate,
    granularity,
    month: granularity === 'months' ? selMonth : initial.month,
    week: granularity === 'weeks' ? selWeek : initial.week,
    day: granularity === 'days' ? selDay : initial.day,
  }
  const { rows, loading } = useDelays(query)
  const sortedRows = sortDelays(rows, sort)

  // Pagination always starts at the first page when the query, sort, or page size changes.
  const resetKey = `${JSON.stringify(query)}|${JSON.stringify(sort)}|${pageSize}`
  const [seenResetKey, setSeenResetKey] = useState(resetKey)
  let currentPage = page
  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey)
    setPage(1)
    currentPage = 1
  }

  function handleSort(column: SortColumn) {
    setSort((current) => cycleSort(current, column))
  }

  function handleToday() {
    const today = todaySelections()
    setGranularity('days')
    setSelMonth(today.month)
    setSelWeek(today.week)
    setSelDay(today.day)
    setNavKey((k) => k + 1) // remount DateNavigator so its displayed periods reset to today
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1126px] space-y-10 px-6 py-8">
        <Section title="Select stations">
          <StationPicker
            stationA={stationA}
            stationB={stationB}
            ignoreDirection={ignoreDirection}
            includeIntermediate={includeIntermediate}
            onChangeA={setStationA}
            onChangeB={setStationB}
            onChangeIgnoreDirection={setIgnoreDirection}
            onChangeIncludeIntermediate={setIncludeIntermediate}
          />
        </Section>

        <Section title="View by">
          <div className="space-y-4">
            <ViewBy
              granularity={granularity}
              onChange={setGranularity}
              onToday={handleToday}
              isToday={granularity === 'days' && isCurrentPeriod(query)}
            />
            <DateNavigator
              key={navKey}
              granularity={granularity}
              selMonth={selMonth}
              selWeek={selWeek}
              selDay={selDay}
              onSelectMonth={setSelMonth}
              onSelectWeek={setSelWeek}
              onSelectDay={setSelDay}
            />
          </div>
        </Section>

        <Section title="Delays">
          <DelaysSection
            query={query}
            rows={sortedRows}
            loading={loading}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sort={sort}
            onSort={handleSort}
          />
        </Section>
      </main>
    </>
  )
}

export default App
