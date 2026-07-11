import { useTranslation } from 'react-i18next'
import type { Insight } from '@/types/learning'

interface InsightCardProps {
  insight: Insight
  relatedSurfaces?: string[]
  onClose?: () => void
  className?: string
}

const TYPE_KEY: Record<Insight['type'], string> = {
  morphology: 'insight.type.morphology',
  metaphor: 'insight.type.metaphor',
  cultural: 'insight.type.cultural',
  cognate: 'insight.type.cognate',
  core_image: 'insight.type.coreImage',
}

export function InsightCard({ insight, relatedSurfaces = [], onClose, className }: InsightCardProps) {
  const { t, i18n } = useTranslation()
  const content =
    i18n.language === 'en' && insight.content_en ? insight.content_en : insight.content_ja

  return (
    <div
      className={`border border-border bg-bg-elevated p-4 shadow-sm ${className ?? ''}`}
      role="region"
      aria-label={t('insight.title')}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded bg-accent/15 px-2 py-0.5 font-sans text-xs font-medium text-accent">
          {t(TYPE_KEY[insight.type])}
        </span>
        {onClose ? (
          <button
            type="button"
            className="font-sans text-sm text-text-muted hover:text-text-primary"
            onClick={onClose}
            aria-label={t('nav.close')}
          >
            ×
          </button>
        ) : null}
      </div>
      <p className="font-serif text-lg leading-relaxed text-text-primary">{content}</p>
      {relatedSurfaces.length > 0 ? (
        <p className="mt-4 font-sans text-sm text-text-secondary">
          {t('insight.related')}:{' '}
          {relatedSurfaces.map((surface, index) => (
            <span key={surface}>
              {index > 0 ? ' · ' : null}
              <span className="font-medium text-text-primary">{surface}</span>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}
