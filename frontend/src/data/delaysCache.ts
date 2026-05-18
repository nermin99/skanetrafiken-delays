import type { DelayRecord } from '../types'
import { toISODate } from '../lib/dates'

const STORAGE_PREFIX = 'delays:v1:'
const memoryCache = new Map<string, DelayRecord[]>()

function rangeKey(start: string, end: string): string {
  return `${start}|${end}`
}

// Ranges whose `end` is today or later are skipped entirely — today's delays may still be
// arriving, so we never want to serve a stale snapshot for them.
function isImmutableRange(end: string): boolean {
  return end < toISODate(new Date())
}

export function getCachedRows(start: string, end: string): DelayRecord[] | null {
  if (!isImmutableRange(end)) return null
  const key = rangeKey(start, end)
  const hit = memoryCache.get(key)
  if (hit) return hit
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DelayRecord[]
    memoryCache.set(key, parsed)
    return parsed
  } catch {
    return null
  }
}

export function setCachedRows(start: string, end: string, rows: DelayRecord[]): void {
  if (!isImmutableRange(end)) return
  const key = rangeKey(start, end)
  memoryCache.set(key, rows)
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(rows))
  } catch {
    // Storage full or unavailable — in-memory cache still works for this session.
  }
}
