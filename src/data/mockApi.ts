import type { DelayQuery, DelayRecord, Station } from '../types'
import { parseISODate, rangeForQuery, toISODate } from '../lib/dates'

/** FNV-1a hash → 32-bit unsigned. */
function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Tiny deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function eachDay(startIso: string, endIso: string): string[] {
  const days: string[] = []
  const end = parseISODate(endIso)
  for (let d = parseISODate(startIso); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    days.push(toISODate(d))
  }
  return days
}

function delayForRoll(roll: number, rand: () => number): number | null {
  if (roll < 0.45) return null // on time — not a "delay" row
  if (roll < 0.75) return 1 + Math.floor(rand() * 19) // 1–19  → no background
  if (roll < 0.9) return 20 + Math.floor(rand() * 20) // 20–39 → yellow
  if (roll < 0.97) return 40 + Math.floor(rand() * 20) // 40–59 → orange
  return 60 + Math.floor(rand() * 36) // 60–95 → red
}

function delaysForDay(dayIso: string, stationA: Station, stationB: Station): DelayRecord[] {
  const rand = mulberry32(hashString(`${stationA}->${stationB}|${dayIso}`))
  const tripCount = 14 + Math.floor(rand() * 8) // 14–21 scheduled trips
  const rows: DelayRecord[] = []
  for (let i = 0; i < tripCount; i++) {
    const minutesOfDay = 5 * 60 + Math.floor(rand() * 18 * 60) // 05:00 – 23:00
    const time = `${pad2(Math.floor(minutesOfDay / 60))}:${pad2(minutesOfDay % 60)}`
    const aToB = rand() < 0.5
    const trainNumber = String(1100 + Math.floor(rand() * 800))
    const delayMinutes = delayForRoll(rand(), rand)
    if (delayMinutes == null) continue
    rows.push({
      id: `${dayIso}#${i}`,
      date: dayIso,
      time,
      trainNumber,
      origin: aToB ? stationA : stationB,
      destination: aToB ? stationB : stationA,
      delayMinutes,
    })
  }
  return rows
}

/**
 * Stand-in for the real delays API. Deterministic per (station pair, day) so the same
 * period always returns the same rows; resolves after a short fake network delay.
 */
export function fetchDelays(query: DelayQuery): Promise<DelayRecord[]> {
  if (query.stationA === query.stationB) return Promise.resolve([])

  const { start, end } = rangeForQuery(query)
  const rows = eachDay(start, end).flatMap((day) => delaysForDay(day, query.stationA, query.stationB))
  const latency = 600 + Math.random() * 500
  return new Promise((resolve) => setTimeout(() => resolve(rows), latency))
}
