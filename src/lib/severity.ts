export type SeverityLevel = 'none' | 'low' | 'med' | 'high'

export function severityOf(minutes: number): SeverityLevel {
  if (minutes >= 60) return 'high'
  if (minutes >= 40) return 'med'
  if (minutes >= 20) return 'low'
  return 'none'
}

/** Tailwind classes for the delay badge — colourless under 20 min, then yellow / orange / red. */
export function severityClasses(level: SeverityLevel): string {
  switch (level) {
    case 'low':
      return 'bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950'
    case 'med':
      return 'bg-orange-500 text-white dark:bg-orange-600 dark:text-orange-50'
    case 'high':
      return 'bg-red-600 text-white dark:bg-red-700 dark:text-red-50'
    case 'none':
      return 'text-zinc-700 dark:text-zinc-300'
  }
}
