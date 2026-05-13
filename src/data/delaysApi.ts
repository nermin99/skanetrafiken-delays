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
  const routeId = routeIdFor(query.stationA, query.stationB)

  const { data, errors } = await client.models.Delay.listDelaysByRouteAndDate({
    routeId,
    date: { between: [start, end] },
  })

  if (errors?.length) {
    throw new Error(errors.map((e) => e.message).join('; '))
  }

  return data.map((d) => ({
    id: d.id,
    date: d.date,
    time: d.time,
    trainNumber: d.trainNumber,
    origin: d.origin as Station,
    destination: d.destination as Station,
    delayMinutes: d.delayMinutes,
  }))
}
