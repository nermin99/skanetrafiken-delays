import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import { STATIONS } from '../data/stations'
import type { DelayQuery, DelayRecord, Station } from '../types'
import { rangeForQuery } from '../lib/dates'

const client = generateClient<Schema>()

function routeIdFor(a: Station, b: Station): string {
  return `${a}->${b}`
}

function routeIdsForQuery(query: DelayQuery): string[] {
  const a = STATIONS.indexOf(query.stationA)
  const b = STATIONS.indexOf(query.stationB)
  const [lo, hi] = a < b ? [a, b] : [b, a]
  // Orient the segment so it runs from A toward B; each (from, to) pair then reflects the
  // user-chosen direction, and ignoreDirection adds the reverse on top.
  const segment = STATIONS.slice(lo, hi + 1)
  const oriented = a <= b ? segment : [...segment].reverse()

  const endpoints: Array<[Station, Station]> = query.includeIntermediate
    ? oriented.flatMap((from, i) => oriented.slice(i + 1).map((to) => [from, to] as [Station, Station]))
    : [[query.stationA, query.stationB]]

  const ids = new Set<string>()
  for (const [from, to] of endpoints) {
    ids.add(routeIdFor(from, to))
    if (query.ignoreDirection) ids.add(routeIdFor(to, from))
  }
  return [...ids]
}

export async function fetchDelays(query: DelayQuery): Promise<DelayRecord[]> {
  if (query.stationA === query.stationB) return []

  const { start, end } = rangeForQuery(query)
  const routeIds = routeIdsForQuery(query)

  const responses = await Promise.all(
    routeIds.map((routeId) =>
      client.models.Delay.listDelaysByRouteAndDate({
        routeId,
        date: { between: [start, end] },
      }),
    ),
  )

  const errors = responses.flatMap((r) => r.errors ?? [])
  if (errors.length) {
    throw new Error(errors.map((e) => e.message).join('; '))
  }

  return responses
    .flatMap((r) => r.data)
    .map((d) => ({
      id: d.id,
      date: d.date,
      time: d.time,
      trainNumber: d.trainNumber,
      origin: d.origin as Station,
      destination: d.destination as Station,
      delayMinutes: d.delayMinutes,
    }))
}
