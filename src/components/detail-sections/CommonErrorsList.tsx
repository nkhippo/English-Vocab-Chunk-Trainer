import type { CommonError } from '@/types/learning'

interface CommonErrorsListProps {
  entries: CommonError[]
}

/** Keep ❌/✅ contrast cards but thinner border and lighter background. */
export function CommonErrorsList({ entries }: CommonErrorsListProps) {
  if (entries.length === 0) return null

  return (
    <ul className="space-y-3">
      {entries.map((error) => (
        <li
          key={`${error.incorrect}-${error.correct}`}
          className="rounded border border-border/70 bg-bg-elevated/50 p-3"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="font-sans text-sm text-error sm:text-base">❌ {error.incorrect}</p>
            <span className="hidden font-sans text-text-muted sm:inline" aria-hidden>
              →
            </span>
            <span className="font-sans text-text-muted sm:hidden" aria-hidden>
              ↓
            </span>
            <p className="font-sans text-sm text-success sm:text-base">✅ {error.correct}</p>
          </div>
          <p className="mt-2 font-sans text-sm text-text-secondary">{error.why_ja}</p>
        </li>
      ))}
    </ul>
  )
}
