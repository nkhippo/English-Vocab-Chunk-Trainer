import { useTranslation } from 'react-i18next'
import type { LearningItem } from '@/types/learning'

interface RelatedUsesInlineProps {
  item: LearningItem
  limit?: number
}

export function RelatedUsesInline({ item, limit = 3 }: RelatedUsesInlineProps) {
  const { t } = useTranslation()
  const entries = (item.related_uses ?? []).slice(0, limit)
  if (entries.length === 0) return null

  return (
    <section className="space-y-3">
      <h3 className="font-serif text-[15px] font-medium text-text-primary">
        {t('itemDetail.relatedUsesShort')}
      </h3>
      <ul className="space-y-2">
        {entries.map((use) => (
          <li key={use.form} className="font-sans text-sm text-text-secondary">
            <span className="font-medium text-text-primary">{use.form}</span>
            <span className="mx-2 text-text-muted">──</span>
            <span>{use.meaning_ja}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
