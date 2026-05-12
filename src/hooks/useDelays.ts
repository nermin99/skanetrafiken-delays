import { useEffect, useState } from 'react'
import type { DelayQuery, DelayRecord } from '../types'
import { fetchDelays } from '../data/mockApi'

export function useDelays(query: DelayQuery): { rows: DelayRecord[]; loading: boolean } {
  const key = JSON.stringify(query)
  const [result, setResult] = useState<{ key: string; rows: DelayRecord[] } | null>(null)

  useEffect(() => {
    let ignore = false
    fetchDelays(JSON.parse(key) as DelayQuery).then((rows) => {
      if (!ignore) setResult({ key, rows })
    })
    return () => {
      ignore = true
    }
  }, [key])

  // While the in-flight request is for an older query, treat the data as not yet loaded.
  if (!result || result.key !== key) return { rows: [], loading: true }
  return { rows: result.rows, loading: false }
}
