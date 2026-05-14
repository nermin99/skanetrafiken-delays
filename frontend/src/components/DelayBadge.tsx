import { severityClasses, severityOf } from '../lib/severity'

export function DelayBadge({ minutes }: { minutes: number }) {
  return (
    <span
      className={[
        'inline-flex min-w-[2.75rem] justify-center rounded-md px-2.5 py-1 text-sm font-medium tabular-nums',
        severityClasses(severityOf(minutes)),
      ].join(' ')}
    >
      {minutes}
    </span>
  )
}
