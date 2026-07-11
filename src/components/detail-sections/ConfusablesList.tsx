import { useTranslation } from 'react-i18next'
import type { ConfusableEntry } from '@/types/learning'

interface ConfusablesListProps {
  entries: ConfusableEntry[]
  limit?: number
}

/** Confusables without tile cards; example_en is intentionally not rendered (v9). */
export function ConfusablesList({ entries, limit }: ConfusablesListProps) {
  const { t } = useTranslation()
  const list = limit != null ? entries.slice(0, limit) : entries
  if (list.length === 0) return null

  return (
    <ul className="space-y-4">
      {list.map((conf) => (
        <li key={conf.item} className="space-y-1">
          <p className="font-serif text-[15px] text-text-primary md:text-base">{conf.item}</p>
          <p className="font-sans text-sm leading-snug text-text-secondary">
            <span className="font-medium text-text-primary">{t('itemDetail.similarity')}</span>{' '}
            {conf.similarity_ja}
          </p>
          <p className="font-sans text-sm leading-snug text-text-secondary">
            <span className="font-medium text-text-primary">{t('itemDetail.difference')}</span>{' '}
            {conf.key_difference_ja}
          </p>
          {conf.correct_usage_ja ? (
            <p className="font-sans text-sm leading-snug text-text-secondary">
              <span className="font-medium text-text-primary">{t('itemDetail.usage')}</span>{' '}
              {conf.correct_usage_ja}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
