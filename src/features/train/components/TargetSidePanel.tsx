import { useTranslation } from 'react-i18next'
import {
  AccordionSection,
  ConfusablesList,
  ExamplesList,
  RelatedUsesList,
} from '@/components/detail-sections'
import { IpaTabs } from '@/components/ipa-tabs'
import type { LearningItem } from '@/types/learning'

interface TargetSidePanelProps {
  item: LearningItem
  onClose?: () => void
  /** Compact Mode A/B panel: limit lists, hide related-use examples. */
  compact?: boolean
}

/** Item detail body shared by Mode A/B drawer (no OK/Hold, no checkmarks). */
export function TargetSidePanel({ item, onClose, compact = true }: TargetSidePanelProps) {
  const { t } = useTranslation()
  const examples = item.example_sentences ?? []
  const confusables = item.confusables ?? []
  const relatedUses = item.related_uses ?? []
  const confLimit = compact ? 3 : undefined
  const relatedLimit = compact ? 3 : undefined

  return (
    <aside className="flex h-full flex-col bg-bg-panel">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 space-y-2">
          <h2 className="font-serif text-2xl font-semibold leading-tight text-text-primary md:text-[28px]">
            {item.surface}
          </h2>
          <IpaTabs careful={item.ipa_careful} connected={item.ipa_connected} />
          <p className="font-sans text-base text-text-primary">{item.translations_ja[0]}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            aria-label={t('nav.close')}
            className="grid size-10 shrink-0 place-items-center text-text-secondary hover:text-text-primary"
            onClick={onClose}
          >
            <span className="text-xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {examples.length > 0 ? (
          <AccordionSection title={t('itemDetail.examples')} defaultOpen>
            <ExamplesList examples={examples} />
          </AccordionSection>
        ) : null}

        {confusables.length > 0 ? (
          <AccordionSection title={t('itemDetail.confusables')} defaultOpen>
            <ConfusablesList entries={confusables} limit={confLimit} />
          </AccordionSection>
        ) : null}

        {relatedUses.length > 0 ? (
          <AccordionSection title={t('itemDetail.relatedUsesShort')} defaultOpen>
            <RelatedUsesList entries={relatedUses} limit={relatedLimit} showDetails={!compact} />
          </AccordionSection>
        ) : null}
      </div>
    </aside>
  )
}
