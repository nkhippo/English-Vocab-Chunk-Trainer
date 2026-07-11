import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckmarkRow } from '@/components/checkmark-row'
import { InsightCard } from '@/components/insight-card'
import { IpaTabs } from '@/components/ipa-tabs'
import { Modal } from '@/components/ui/Modal'
import { useCheckmark } from '@/lib/checkmarks'
import { getInsightById, getSurfacesByIds } from '@/lib/db'
import { labelCategory, labelSkillFocus, metaValue } from '@/lib/i18n/labels'
import type { AntonymEntry, Insight, LearningItem, RelatedUseEntry, SynonymEntry } from '@/types/learning'

interface ItemDetailModalProps {
  item: LearningItem | null
  open: boolean
  onClose: () => void
}

function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-serif text-lg text-text-primary">{title}</span>
        <span className="font-sans text-sm text-text-muted">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="space-y-3 border-t border-border px-4 py-4">{children}</div> : null}
    </div>
  )
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

function shouldShowExample(entry: { example_en?: string; example_ja?: string }): boolean {
  return Boolean(entry.example_en?.trim()) && Boolean(entry.example_ja?.trim())
}

function ContrastEntryCard({ entry }: { entry: SynonymEntry | AntonymEntry }) {
  return (
    <div className="space-y-2 border border-border bg-bg-base p-3">
      <p className="font-serif text-lg text-text-primary">{entry.item}</p>
      <p className="font-sans text-sm leading-relaxed text-text-secondary">{entry.nuance_contrast_ja}</p>
      {shouldShowExample(entry) ? (
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-serif text-sm text-text-primary">{entry.example_en}</p>
          <p className="font-sans text-sm text-text-secondary">{entry.example_ja}</p>
        </div>
      ) : null}
    </div>
  )
}

function RelatedUseCard({ use }: { use: RelatedUseEntry }) {
  return (
    <div className="space-y-2 border border-border bg-bg-base p-3">
      <p className="font-serif text-lg text-text-primary">{use.form}</p>
      <p className="font-sans text-sm text-text-secondary">{use.meaning_ja}</p>
      {use.metaphor_ja ? <p className="font-sans text-xs text-text-muted">{use.metaphor_ja}</p> : null}
      {shouldShowExample(use) ? (
        <div className="space-y-1 border-t border-border pt-2">
          <p className="font-serif text-sm text-text-primary">{use.example_en}</p>
          <p className="font-sans text-sm text-text-secondary">{use.example_ja}</p>
        </div>
      ) : null}
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
      <div className="space-y-5">
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

        <section className="space-y-3">
          <h3 className="font-serif text-lg text-text-primary">{t('itemDetail.examples')}</h3>
          {examples.length > 0 ? (
            <div className="space-y-3">
              {examples.map((example) => (
                <div
                  key={`${example.register}-${example.en}`}
                  className="border border-border bg-bg-base p-4"
                >
                  <p className="font-serif text-lg leading-relaxed text-text-primary">{example.en}</p>
                  <p className="mt-2 font-sans text-base text-text-secondary">{example.ja}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">{t('itemDetail.none')}</p>
          )}
        </section>

        {showRelatedWords ? (
          <AccordionSection title={t('itemDetail.relatedWords')} defaultOpen>
            <div className="space-y-4">
              {(item.synonyms ?? []).length > 0 ? (
                <div className="space-y-3">
                  <p className="font-sans text-sm font-medium text-text-primary">{t('itemDetail.synonyms')}</p>
                  {(item.synonyms ?? []).map((syn) => (
                    <ContrastEntryCard key={syn.item} entry={syn} />
                  ))}
                </div>
              ) : null}
              {(item.antonyms ?? []).length > 0 ? (
                <div className="space-y-3">
                  <p className="font-sans text-sm font-medium text-text-primary">{t('itemDetail.antonyms')}</p>
                  {(item.antonyms ?? []).map((ant) => (
                    <ContrastEntryCard key={ant.item} entry={ant} />
                  ))}
                </div>
              ) : null}
            </div>
          </AccordionSection>
        ) : null}

        {hasConfusables ? (
          <AccordionSection title={t('itemDetail.confusables')} defaultOpen>
            {(item.confusables ?? []).map((conf) => (
              <div key={conf.item} className="space-y-1 border border-border bg-bg-base p-3">
                <p className="font-serif text-lg text-text-primary">{conf.item}</p>
                <p className="font-sans text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">{t('itemDetail.similarity')}</span>{' '}
                  {conf.similarity_ja}
                </p>
                <p className="font-sans text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">{t('itemDetail.difference')}</span>{' '}
                  {conf.key_difference_ja}
                </p>
                {conf.correct_usage_ja ? (
                  <p className="font-sans text-sm text-text-secondary">
                    <span className="font-medium text-text-primary">{t('itemDetail.usage')}</span>{' '}
                    {conf.correct_usage_ja}
                  </p>
                ) : null}
                {conf.example_en ? (
                  <p className="font-serif text-sm italic text-text-muted">{conf.example_en}</p>
                ) : null}
              </div>
            ))}
          </AccordionSection>
        ) : null}

        {hasCommonErrors ? (
          <AccordionSection title={t('itemDetail.commonErrors')} defaultOpen>
            {(item.common_errors_ja ?? []).map((error) => (
              <div key={`${error.incorrect}-${error.correct}`} className="border border-border bg-bg-base p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <p className="font-sans text-base text-error">❌ {error.incorrect}</p>
                  <span className="hidden font-sans text-text-muted sm:inline" aria-hidden>
                    →
                  </span>
                  <span className="font-sans text-text-muted sm:hidden" aria-hidden>
                    ↓
                  </span>
                  <p className="font-sans text-base text-success">✅ {error.correct}</p>
                </div>
                <p className="mt-2 font-sans text-sm text-text-secondary">{error.why_ja}</p>
              </div>
            ))}
          </AccordionSection>
        ) : null}

        {hasRelatedUses ? (
          <AccordionSection title={t('itemDetail.relatedUses')} defaultOpen={false}>
            {(item.related_uses ?? []).map((use) => (
              <RelatedUseCard key={use.form} use={use} />
            ))}
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
