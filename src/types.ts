import type { STATIONS } from './data/stations'

export type Station = (typeof STATIONS)[number]

export type Granularity = 'months' | 'weeks' | 'days'

/** Calendar month. `month` is 0-based (0 = January). */
export type MonthSel = { year: number; month: number }

/** ISO-8601 week. `year` is the ISO week-numbering year. */
export type WeekSel = { year: number; week: number }

/** A single calendar day, formatted `yyyy-mm-dd`. */
export type DaySel = string

export type DelayQuery = {
  stationA: Station
  stationB: Station
  ignoreDirection: boolean
  includeIntermediate: boolean
  granularity: Granularity
  month: MonthSel
  week: WeekSel
  day: DaySel
}

export type DelayRecord = {
  id: string
  /** `yyyy-mm-dd` */
  date: string
  /** `HH:mm` */
  time: string
  trainNumber: string
  origin: Station
  destination: Station
  delayMinutes: number
}

export type SortColumn = 'date' | 'time' | 'trainNumber' | 'origin' | 'destination' | 'delayMinutes'

export type SortDir = 'asc' | 'desc'
