import { useState } from 'react'
import type { DelayQuery, Granularity, SortColumn, SortDir, Station } from './types'
import { todaySelections } from './lib/dates'
import { sortDelays } from './lib/sortDelays'
import { useDelays } from './hooks/useDelays'
import { Header } from './components/Header'
import { Section } from './components/Section'
import { StationPicker } from './components/StationPicker'
import { ViewBy } from './components/ViewBy'
import { DateNavigator } from './components/DateNavigator'
import { DelaysSection } from './components/DelaysSection'

const initial = todaySelections()

function App() {
  const [stationA, setStationA] = useState<Station>('Malmö C')
  const [stationB, setStationB] = useState<Station>('Köpenhamn H')
  const [granularity, setGranularity] = useState<Granularity>('days')
  const [selMonth, setSelMonth] = useState(initial.month)
  const [selWeek, setSelWeek] = useState(initial.week)
  const [selDay, setSelDay] = useState(initial.day)
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [navKey, setNavKey] = useState(0)

  const query: DelayQuery = { stationA, stationB, granularity, month: selMonth, week: selWeek, day: selDay }
  const { rows, loading } = useDelays(query)
  const sortedRows = sortDelays(rows, sortColumn, sortDir)

  // Pagination always starts at the first page when the query or the sort changes.
  const resetKey = `${JSON.stringify(query)}|${sortColumn}|${sortDir}`
  const [seenResetKey, setSeenResetKey] = useState(resetKey)
  let currentPage = page
  if (seenResetKey !== resetKey) {
    setSeenResetKey(resetKey)
    setPage(1)
    currentPage = 1
  }

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDir('asc')
    }
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
          <StationPicker stationA={stationA} stationB={stationB} onChangeA={setStationA} onChangeB={setStationB} />
        </Section>

        <Section title="View by">
          <div className="space-y-4">
            <ViewBy granularity={granularity} onChange={setGranularity} onToday={handleToday} />
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
            onPageChange={setPage}
            sortColumn={sortColumn}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </Section>
      </main>
    </>
  )
}

export default App
