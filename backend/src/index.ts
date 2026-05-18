import type { Journey, JourneyResponse } from './types/api'

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb')
const { randomUUID } = require('node:crypto')
const dotenv = require('dotenv')
dotenv.config()

let client
if (process.env.NODE_ENV !== 'production') {
  client = new DynamoDBClient({
    region: 'eu-north-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  })
} else {
  client = new DynamoDBClient({ region: 'eu-north-1' })
}
const docClient = DynamoDBDocumentClient.from(client)

const DYNAMODB_TABLE_NAME = 'Delay-ue5opsharbbplc2njsts6txnii-NONE'
const MIN_DELAY_MINUTES = 20

const BASE_NEGATIVE = '../skanetrafiken-api/example-responses/negative/'
const BASE_POSITIVE = '../skanetrafiken-api/example-responses/positive/'

interface StationPoint {
  point: string
  station: string
  country: string
}

const stationPoints: StationPoint[] = [
  {
    point: '9021012031031000',
    station: 'Burlöv',
    country: 'sweden',
  },
  {
    point: '9021012080000000',
    station: 'Malmö C',
    country: 'sweden',
  },
  {
    point: '9021012080140000',
    station: 'Malmö Triangeln',
    country: 'sweden',
  },
  {
    point: '9021012080040000',
    station: 'Malmö Hyllie',
    country: 'sweden',
  },
  {
    point: '9021012045006000',
    station: 'CPH Airport Kastrup',
    country: 'denmark',
  },
  {
    point: '9021012045008000',
    station: 'Tårnby',
    country: 'denmark',
  },
  {
    point: '9021012045005000',
    station: 'Ørestad',
    country: 'denmark',
  },
  {
    point: '9021012045007000',
    station: 'Köpenhamn H',
    country: 'denmark',
  },
  {
    point: '9021012045012000',
    station: 'Köpenhamn Nørreport',
    country: 'denmark',
  },
  {
    point: '9021012045011000',
    station: 'Köpenhamn Østerport',
    country: 'denmark',
  },
]

const stationToPointMap = Object.fromEntries(stationPoints.map(({ point, station }) => [station, point]))
const pointToStationMap = Object.fromEntries(stationPoints.map(({ point, station }) => [point, station]))
const countryCombinationsStations = stationPoints.flatMap((stationA) =>
  stationPoints
    .filter((stationB) => stationA.country !== stationB.country)
    .map((stationB) => ({
      stationA: stationA.station,
      stationB: stationB.station,
    }))
)

const allTrips = countryCombinationsStations
// console.log(allTrips)

// UTILS ###############################################################################################################
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

/**
 * Returns the current UTC time floored to the hour, optionally shifted into the past by `offsetHours`.
 *
 * @param offsetHours Number of hours to shift into the past from the current time. Defaults to 0.
 *
 * @example
 * // At 08:26 UTC (or 10:26 UTC+2):
 * getUtcDateTimeFloored(0) // 2026-06-30T08:00:00.000Z
 * getUtcDateTimeFloored(1) // 2026-06-30T07:00:00.000Z
 */
const getUtcDateTimeFloored = (offsetHours = 0) => {
  const now = new Date()

  const offsetMilliseconds = offsetHours * 60 * 60 * 1000
  const utcDateTimeFloored = new Date(now.getTime() - offsetMilliseconds)
  utcDateTimeFloored.setUTCMinutes(0, 0, 0)

  return utcDateTimeFloored
}

/**
 * @param timeStr HH:MM
 * @param dateStr YYYY-MM-DD
 */
const createDateTime = (timeStr = '', dateStr = '') => {
  if (!dateStr && !timeStr) return new Date()

  if (!dateStr) {
    dateStr = new Date().toISOString().split('T')[0]
  }

  return new Date(`${dateStr}T${timeStr}`)
}

// API #################################################################################################################
const BASE_URL = 'https://www.skanetrafiken.se/gw-tps/api/v2'
const requestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Search-Engine-Environment': 'TjP',
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.80 Mobile Safari/537.36',
  },
}

async function fetchJourneys(stationA: string, stationB: string, journeyDateTime: Date, event: any) {
  if (event?.MOCK_RESPONSE) return event.MOCK_RESPONSE as JourneyResponse

  const fromPointId = stationToPointMap[stationA]
  const toPointId = stationToPointMap[stationB]

  if (!fromPointId) throw new Error(`Unknown station "${stationA}". No mapped point id`)
  if (!toPointId) throw new Error(`Unknown station "${stationB}". No mapped point id`)

  const url = new URL(`${BASE_URL}/Journey`)
  url.searchParams.set('fromPointType', 'STOP_AREA')
  url.searchParams.set('toPointType', 'STOP_AREA')
  url.searchParams.set('fromPointId', fromPointId)
  url.searchParams.set('toPointId', toPointId)
  url.searchParams.set('journeyDateTime', journeyDateTime.toISOString())
  url.searchParams.set('arrival', 'false')
  url.searchParams.set('journeysAfter', '8')
  console.info(url.toString())

  const response = await fetch(url, requestOptions)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText} (${stationA} -> ${stationB})`)
  }

  const data = await response.json()
  if (!data.journeys) {
    throw new Error(`No journeys found for ${stationA} -> ${stationB} @ ${journeyDateTime}`)
  }

  // Filter out journeys with stations that are not in the original search (seems to be a bug in the API that it sometimes returns journeys with other stations)
  data.journeys = (data.journeys as Journey[]).filter((journey) => {
    const firstLink = journey.routeLinks[0]
    const lastLink = journey.routeLinks[journey.routeLinks.length - 1]
    return firstLink?.from.id2 === fromPointId && lastLink?.to.id2 === toPointId
  })

  return data as JourneyResponse
}

// CORE LOGIC ##########################################################################################################
/**
 * Finds eligible delayed journeys based on the assumption that, with the current timetable
 * (e.g. 06:59, 07:08, 07:14, 07:29, 07:38, 07:44, 07:59),
 * it is enough to use a rolling window of 3 journeys (because the total arrival time delta between 3 consecutive
 * journeys is at minimum 30 minutes, which is greater than 20 minutes).
 *
 * In order for a journey to start being considered eligible (i.e. a candidate), the following criteria are necessary: \
 * Either 1. be delayed by at least 20 minutes, or 2. be cancelled. \
 * However, neither is sufficient because even if the first journey is delayed or cancelled, the second journey might be
 * on time and arrive less than 20 minutes after the first journey, making the *effective* delay of the first journey
 * less than 20 minutes. This can be generalized up to the third journey as well, but we don't have to check further
 * than that because of the timetable structure described above.
 *
 * There is one quirk: if three journeys in a row are cancelled, we unfortunately don't know the total delay, but we can
 * assume it is at least 20 minutes (actually at least the arrival time difference between the first and third journey).
 */
const findEligibleDelayedJourneys = (journeys: Journey[]) => {
  const eligibleDelayedJourneys = []

  const journeysSorted = journeys.toSorted(sortJourneysByFromTimeAscending)

  for (let idx = 0; idx < journeysSorted.length; idx++) {
    const journey1 = journeysSorted[idx]
    const journey2 = journeysSorted[idx + 1]
    const journey3 = journeysSorted?.[idx + 2]

    // Exit if reached end of array
    if (!journey3) break

    // Check first journey
    let isStillCandidate = isCancelledOrSufficientlyDelayed(journey1, MIN_DELAY_MINUTES)
    if (!isStillCandidate) continue

    // Check second journey
    const arrivalTimeDiff1to2 = calculateArrivalTimeDiff(journey1, journey2)
    const requiredDelay2 = Math.max(0, MIN_DELAY_MINUTES - arrivalTimeDiff1to2)
    isStillCandidate = isCancelledOrSufficientlyDelayed(journey2, requiredDelay2)
    if (!isStillCandidate) continue

    // Check third journey
    const arrivalTimeDiff1to3 = calculateArrivalTimeDiff(journey1, journey3)
    const requiredDelay3 = Math.max(0, MIN_DELAY_MINUTES - arrivalTimeDiff1to3)
    isStillCandidate = isCancelledOrSufficientlyDelayed(journey3, requiredDelay3)

    if (isStillCandidate) {
      const effectiveDelay = calculateEffectiveDelay(
        [journey1, journey2, journey3],
        [arrivalTimeDiff1to2, arrivalTimeDiff1to3]
      )
      eligibleDelayedJourneys.push({
        journey: journey1,
        effectiveDelay,
      })
    }
  }

  return eligibleDelayedJourneys
}

const sortJourneysByFromTimeAscending = (a: Journey, b: Journey) =>
  new Date(a.routeLinks[0].from.time).getTime() - new Date(b.routeLinks[0].from.time).getTime()

const isCancelledOrSufficientlyDelayed = (journey: Journey, minDelay: number): boolean => {
  if (isCancelled(journey)) return true

  const delay = journey.routeLinks[0].to.deviation ?? 0
  return delay >= minDelay
}

const isCancelled = (journey: Journey): boolean =>
  ['INSTÄLLD', 'CANCELLED'].includes(journey.deviationTag?.text?.toUpperCase() ?? '')

const calculateArrivalTimeDiff = (journey1: Journey, journey2: Journey): number => {
  const time1 = new Date(journey1.routeLinks[0].to.time).getTime()
  const time2 = new Date(journey2.routeLinks[0].to.time).getTime()
  return (time2 - time1) / (1000 * 60) // Convert milliseconds to minutes
}

/**
 * The effective delay is either just the delay of the first journey, or if the first journey is cancelled then
 * it is the arrival time difference to the second journey plus any delay of the second journey, and so on for the
 * third journey if the second is also cancelled.
 */
const calculateEffectiveDelay = (journeys: Journey[], arrivalTimeDiffs: number[]): number => {
  const [journey1, journey2, journey3] = journeys
  const [arrivalTimeDiff1to2, arrivalTimeDiff1to3] = arrivalTimeDiffs

  const journey1Delay = journey1.routeLinks[0].to.deviation ?? 0
  const journey2Delay = journey2.routeLinks[0].to.deviation ?? 0
  const journey3Delay = journey3.routeLinks[0].to.deviation ?? 0

  if (!isCancelled(journey1)) return journey1Delay

  if (!isCancelled(journey2)) return journey2Delay + arrivalTimeDiff1to2

  if (!isCancelled(journey3)) return journey3Delay + arrivalTimeDiff1to3

  // In the rare case that three journeys are cancelled in a row (and we unfortunately don't know the total delay), we return a number so high it will catch the attention of the user, meanwhile still including the arrival time differences to somewhat reflect the actual (minimum) delay
  return 1000 + arrivalTimeDiff1to3 // TODO: Improve edge case
}

// LAMBDA HANDLER ######################################################################################################
const handler = async (event: any) => {
  console.info({ event })

  const eligibleDelayedJourneys = []

  const offsetHours = 2
  const journeyDateTime: Date = event?.TIME ?? getUtcDateTimeFloored(offsetHours)

  let tripCount = 1
  for (const { stationA, stationB } of allTrips) {
    console.log(`${tripCount}/${allTrips.length}`)

    const journeyResponse = await fetchJourneys(stationA, stationB, journeyDateTime, event)
    const delayedJourneys = findEligibleDelayedJourneys(journeyResponse.journeys)

    if (delayedJourneys.length > 0) {
      eligibleDelayedJourneys.push(delayedJourneys)
    }

    // Rate limiting
    await sleep(250)
    tripCount++

    if (event?.MOCK_RESPONSE) break
  }

  const delayedJourneysMapped = mapDelayedJourneysToDynamoDbTable(eligibleDelayedJourneys)

  const worstDelayedJourneys = keepMaxByGroup(delayedJourneysMapped, 'trainNumber', 'delayMinutes')
  console.info(worstDelayedJourneys.length)

  if (worstDelayedJourneys.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'No delays found' }),
    }
  }

  if (event?.ENV === 'DEV') return worstDelayedJourneys

  return await uploadDelayedJourneysToDB(worstDelayedJourneys)
}

const mapDelayedJourneysToDynamoDbTable = (eligibleDelayedJourneys: { journey: Journey; effectiveDelay: number }[][]) =>
  eligibleDelayedJourneys.flat().map(({ journey, effectiveDelay }) => {
    const journeyData = journey.routeLinks[0]

    const fromTime = journeyData.from.time
    const applyDate = new Date(fromTime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
    const applyTime = new Date(fromTime).toLocaleTimeString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      hour: '2-digit',
      minute: '2-digit',
    })
    const now = new Date().toISOString()
    const origin = pointToStationMap[journeyData.from.id2]
    const destination = pointToStationMap[journeyData.to.id2]

    if (!origin) throw new Error(`Unknown origin point id: ${journeyData.from.id2}`)
    if (!destination) throw new Error(`Unknown destination point id: ${journeyData.to.id2}`)

    return {
      id: randomUUID(),
      routeId: `${origin}->${destination}`,
      date: applyDate,
      time: applyTime,
      trainNumber: String(journeyData.line.runNo ?? ''),
      origin,
      destination,
      delayMinutes: Math.round(effectiveDelay),
      createdAt: now,
      updatedAt: now,
      __typename: 'Delay',
    }
  })

/**
 * Groups an array of objects by `groupByKey` and retains only one object per group - either with the highest value for
 * a given `maxByKey`, or the one marked as cancelled.
 *
 * E.g. keeping only the train numbers with the highest delay.
 */
const keepMaxByGroup = (arr: any[], groupByKey: string, maxByKey: string) => {
  return Object.values(
    arr.reduce((acc, curr) => {
      const existing = acc[curr[groupByKey]]

      if (!existing) {
        acc[curr[groupByKey]] = curr
      } else if (curr.isCancelled) {
        acc[curr[groupByKey]] = curr
      } else if (curr[maxByKey] >= existing[maxByKey]) {
        acc[curr[groupByKey]] = curr
      }

      return acc
    }, {})
  )
}

const uploadDelayedJourneysToDB = async (delayedJourneysGrouped: any[]) => {
  const upsertParams = {
    RequestItems: {
      [DYNAMODB_TABLE_NAME]: delayedJourneysGrouped.map((item) => ({
        PutRequest: {
          Item: item,
        },
      })),
    },
  }
  const response = await docClient.send(new BatchWriteCommand(upsertParams))

  const unprocessed = response.UnprocessedItems?.[DYNAMODB_TABLE_NAME] ?? []
  if (unprocessed.length > 0) {
    throw new Error(`DynamoDB BatchWrite returned ${unprocessed.length} unprocessed item(s)`)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

// If running locally (not in Lambda)
if (require.main === module) {
  const event: any = {}
  event['ENV'] = process.env.ENV
  event['TIME'] = process.env.TIME ? createDateTime(process.env.TIME) : null
  event['MOCK_RESPONSE'] = process.env.MOCK ? require(BASE_POSITIVE + '9-multiple-delayed.json') : null

  handler(event)
    .then((result) => console.log('Result:', result))
    .catch((err) => console.error('Error:', err))
}

// For unit tests
exports.findEligibleDelayedJourneys = findEligibleDelayedJourneys

// For AWS Lambda
exports.handler = handler
