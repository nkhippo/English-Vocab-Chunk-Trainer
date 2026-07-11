import type { RelatedUseEntry } from '@/types/learning'

interface RelatedUsesListProps {
  entries: RelatedUseEntry[]
  limit?: number
  /** When false, hide metaphor/examples (Mode A compact). Default true for modal. */
  showDetails?: boolean
}

function shouldShowExample(entry: { example_en?: string; example_ja?: string }): boolean {
  return Boolean(entry.example_en?.trim()) && Boolean(entry.example_ja?.trim())
}

/** Related uses: form + meaning; no tile cards. */
export function RelatedUsesList({ entries, limit, showDetails = true }: RelatedUsesListProps) {
  const list = limit != null ? entries.slice(0, limit) : entries
  if (list.length === 0) return null

  return (
    <ul className="space-y-3">
      {list.map((use) => (
        <li key={use.form} className="space-y-1">
          <p className="font-sans text-sm text-text-secondary">
            <span className="font-serif text-[15px] font-medium text-text-primary md:text-base">
              {use.form}
            </span>
            <span className="mx-2 text-text-muted">──</span>
            <span>{use.meaning_ja}</span>
          </p>
          {showDetails && use.metaphor_ja ? (
            <p className="font-sans text-xs text-text-muted">{use.metaphor_ja}</p>
          ) : null}
          {showDetails && shouldShowExample(use) ? (
            <div className="space-y-0.5 pl-0.5">
              <p className="font-serif text-sm text-text-primary">{use.example_en}</p>
              <p className="font-sans text-sm text-text-secondary">{use.example_ja}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
