import { useTranslation } from 'react-i18next'
import type { LearningItem } from '@/types/learning'

interface ConfusablesInlineProps {
  item: LearningItem
  limit?: number
}

export function ConfusablesInline({ item, limit = 3 }: ConfusablesInlineProps) {
  const { t } = useTranslation()
  const entries = (item.confusables ?? []).slice(0, limit)
  if (entries.length === 0) return null

  return (
    <section className="space-y-3">
      <h3 className="font-serif text-[15px] font-medium text-text-primary">{t('itemDetail.confusables')}</h3>
      <ul className="space-y-3">
        {entries.map((conf) => (
          <li key={conf.item} className="space-y-0.5">
            <p className="font-serif text-base text-text-primary">{conf.item}</p>
            <p className="font-sans text-sm leading-snug text-text-secondary">{conf.key_difference_ja}</p>
            {conf.correct_usage_ja ? (
              <p className="font-sans text-sm leading-snug text-text-muted">{conf.correct_usage_ja}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
