import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckmarkRow } from '@/components/checkmark-row'
import {
  AccordionSection,
  CommonErrorsList,
  ConfusablesList,
  ContrastEntriesList,
  ExamplesList,
  RelatedUsesList,
} from '@/components/detail-sections'
import { InsightCard } from '@/components/insight-card'
import { IpaTabs } from '@/components/ipa-tabs'
import { Modal } from '@/components/ui/Modal'
import { useCheckmark } from '@/lib/checkmarks'
import { getInsightById, getSurfacesByIds } from '@/lib/db'
import { labelCategory, labelSkillFocus, metaValue } from '@/lib/i18n/labels'
import type { Insight, LearningItem } from '@/types/learning'

interface ItemDetailModalProps {
  item: LearningItem | null
  open: boolean
  onClose: () => void
}

function BrowseDetailCheckmarks({ itemId }: { itemId: string }) {
  const { t } = useTranslation()
  const [count, setCount] = useCheckmark('browse', itemId)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-sans text-sm font-medium text-text-secondary">{t('checkmarks.learningHistory')}</span>
      <CheckmarkRow
        count={count}
        onChange={setCount}
        size="md"
        ariaLabel={t('checkmarks.learningHistory')}
      />
    </div>
  )
}

function hasRelatedWords(item: LearningItem): boolean {
  return (item.synonyms?.length ?? 0) > 0 || (item.antonyms?.length ?? 0) > 0
}

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
  const { t } = useTranslation()
  const [insight, setInsight] = useState<Insight | null>(null)
  const [relatedSurfaces, setRelatedSurfaces] = useState<string[]>([])
  const [insightOpen, setInsightOpen] = useState(false)

  useEffect(() => {
    if (!open || !item) return
    setInsightOpen(false)
  }, [open, item])

  useEffect(() => {
    if (!open || !item?.insight_id) {
      setInsight(null)
      setRelatedSurfaces([])
      return
    }
    let cancelled = false
    void (async () => {
      const found = await getInsightById(item.insight_id!)
      if (cancelled) return
      setInsight(found ?? null)
      if (found?.related_items?.length) {
        setRelatedSurfaces(await getSurfacesByIds(found.related_items))
      } else {
        setRelatedSurfaces([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, item])

  if (!open || !item) return null

  const examples = item.example_sentences ?? []
  const hasConfusables = (item.confusables ?? []).length > 0
  const hasCommonErrors = (item.common_errors_ja ?? []).length > 0
  const hasRelatedUses = (item.related_uses ?? []).length > 0
  const showRelatedWords = hasRelatedWords(item)

  return (
    <Modal open={open} onClose={onClose} title={t('itemDetail.title')}>
      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="font-serif text-[32px] leading-tight text-text-primary">{item.surface}</h2>
          <IpaTabs careful={item.ipa_careful} connected={item.ipa_connected} />
          <p className="font-sans text-xl text-text-primary">{item.translations_ja.join('、')}</p>
          {item.definition_en ? (
            <p className="font-sans text-base leading-relaxed text-text-secondary">{item.definition_en}</p>
          ) : null}
          <BrowseDetailCheckmarks itemId={item.id} />
        </header>

        {insight ? (
          <div className="space-y-3">
            <button
              type="button"
              className="rounded border border-border px-4 py-2 font-sans text-sm font-medium text-text-primary hover:bg-bg-base"
              onClick={() => setInsightOpen((value) => !value)}
            >
              {insightOpen ? t('insight.hide') : t('insight.show')}
            </button>
            {insightOpen ? (
              <InsightCard
                insight={insight}
                relatedSurfaces={relatedSurfaces}
                onClose={() => setInsightOpen(false)}
              />
            ) : null}
          </div>
        ) : null}

        <AccordionSection title={t('itemDetail.examples')} defaultOpen>
          <ExamplesList examples={examples} />
        </AccordionSection>

        {showRelatedWords ? (
          <AccordionSection title={t('itemDetail.relatedWords')} defaultOpen>
            <ContrastEntriesList synonyms={item.synonyms} antonyms={item.antonyms} />
          </AccordionSection>
        ) : null}

        {hasConfusables ? (
          <AccordionSection title={t('itemDetail.confusables')} defaultOpen>
            <ConfusablesList entries={item.confusables ?? []} />
          </AccordionSection>
        ) : null}

        {hasCommonErrors ? (
          <AccordionSection title={t('itemDetail.commonErrors')} defaultOpen>
            <CommonErrorsList entries={item.common_errors_ja ?? []} />
          </AccordionSection>
        ) : null}

        {hasRelatedUses ? (
          <AccordionSection title={t('itemDetail.relatedUses')} defaultOpen={false}>
            <RelatedUsesList entries={item.related_uses ?? []} />
          </AccordionSection>
        ) : null}

        <AccordionSection title={t('itemDetail.meta')} defaultOpen={false}>
          <dl className="grid grid-cols-1 gap-2 font-sans text-xs text-text-secondary sm:grid-cols-2">
            <div>
              <dt className="font-medium text-text-primary">{t('review.fields.cefr')}</dt>
              <dd>{item.cefr_level}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">{t('itemDetail.category')}</dt>
              <dd>{labelCategory(t, item.category)}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">{t('itemDetail.frequency')}</dt>
              <dd className={!item.frequency_rank_in_level ? 'text-text-muted' : undefined}>
                {metaValue(t, item.frequency_rank_in_level)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">{t('itemDetail.semanticField')}</dt>
              <dd className={item.semantic_field.length === 0 ? 'text-text-muted' : undefined}>
                {item.semantic_field.length > 0
                  ? item.semantic_field.join(', ')
                  : t('itemDetail.unset')}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">{t('itemDetail.skillFocus')}</dt>
              <dd>{labelSkillFocus(t, item.skill_focus)}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">{t('review.fields.collocationPattern')}</dt>
              <dd className={!item.collocation_pattern ? 'text-text-muted' : undefined}>
                {metaValue(t, item.collocation_pattern)}
              </dd>
            </div>
          </dl>
        </AccordionSection>
      </div>
    </Modal>
  )
}
