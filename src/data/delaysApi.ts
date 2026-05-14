import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type { DelayQuery, DelayRecord, Station } from '../types'
import { rangeForQuery } from '../lib/dates'

const client = generateClient<Schema>()

function routeIdFor(a: Station, b: Station): string {
  return `${a}->${b}`
}

export async function fetchDelays(query: DelayQuery): Promise<DelayRecord[]> {
  if (query.stationA === query.stationB) return []

  const { start, end } = rangeForQuery(query)
  const routeIds = query.ignoreDirection
    ? [routeIdFor(query.stationA, query.stationB), routeIdFor(query.stationB, query.stationA)]
    : [routeIdFor(query.stationA, query.stationB)]

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
