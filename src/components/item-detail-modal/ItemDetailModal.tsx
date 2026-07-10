import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { labelCategory, labelRegister } from '@/lib/i18n/labels'
import type { LearningItem, Register } from '@/types/learning'

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
    <div className="rounded-2xl border border-line bg-paper">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="text-base font-semibold text-ink">{title}</span>
        <span className="text-sm text-ink-muted">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="space-y-3 border-t border-line px-4 py-4">{children}</div> : null}
    </div>
  )
}

function defaultRegister(registers: Register[]): Register {
  if (registers.includes('neutral')) return 'neutral'
  return registers[0] ?? 'neutral'
}

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
  const { t } = useTranslation()
  const registers = useMemo(() => item?.register ?? [], [item])
  const [activeRegister, setActiveRegister] = useState<Register>('neutral')

  useEffect(() => {
    if (!open || !item) return
    setActiveRegister(defaultRegister(item.register))
  }, [open, item])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !item) return null

  const activeExample =
    item.example_sentences.find((ex) => ex.register === activeRegister) ?? item.example_sentences[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label={t('nav.close')} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-3xl border border-line bg-paper-elevated p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-brand">{t('itemDetail.title')}</p>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-1 text-lg leading-none text-ink-muted hover:text-ink"
            onClick={onClose}
            aria-label={t('nav.close')}
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Section A: Header */}
          <header className="space-y-2">
            <h2 className="font-display text-3xl font-bold text-ink">{item.surface}</h2>
            <p className="font-mono text-lg text-ink-muted">{item.ipa_careful}</p>
            {item.ipa_connected ? (
              <p className="font-mono text-base text-ink-muted/80">{item.ipa_connected}</p>
            ) : null}
            <p className="text-xl text-ink">{item.translations_ja.join('、')}</p>
            {item.definition_en ? (
              <p className="text-base leading-relaxed text-ink-muted">{item.definition_en}</p>
            ) : null}
          </header>

          {/* Section B: Examples */}
          <section className="space-y-3">
            <h3 className="text-base font-semibold text-ink">{t('itemDetail.examples')}</h3>
            {registers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {registers.map((register) => (
                  <button
                    key={register}
                    type="button"
                    onClick={() => setActiveRegister(register)}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      activeRegister === register
                        ? 'bg-brand text-white'
                        : 'border border-line bg-paper text-ink-muted'
                    }`}
                  >
                    {labelRegister(t, register)}
                  </button>
                ))}
              </div>
            ) : null}
            {activeExample ? (
              <div className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-lg leading-relaxed text-ink">{activeExample.en}</p>
                <p className="mt-2 text-base text-ink-muted">{activeExample.ja}</p>
                <p className="mt-2 text-xs text-ink-muted/70">[{activeExample.surrounding_cefr_ceiling}]</p>
              </div>
            ) : (
              <p className="text-ink-muted">{t('itemDetail.none')}</p>
            )}
          </section>

          {/* Section C: Confusables — default open */}
          <AccordionSection title={t('itemDetail.confusables')} defaultOpen>
            {(item.confusables ?? []).length === 0 ? (
              <p className="text-ink-muted">{t('itemDetail.noConfusables')}</p>
            ) : (
              (item.confusables ?? []).map((conf) => (
                <div key={conf.item} className="space-y-1 rounded-xl bg-paper p-3">
                  <p className="text-lg font-semibold text-ink">{conf.item}</p>
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink">{t('itemDetail.similarity')}</span> {conf.similarity_ja}
                  </p>
                  <p className="text-sm text-ink-muted">
                    <span className="font-medium text-ink">{t('itemDetail.difference')}</span>{' '}
                    {conf.key_difference_ja}
                  </p>
                  {conf.correct_usage_ja ? (
                    <p className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{t('itemDetail.usage')}</span> {conf.correct_usage_ja}
                    </p>
                  ) : null}
                  {conf.example_en ? (
                    <p className="text-sm italic text-ink-muted">{conf.example_en}</p>
                  ) : null}
                </div>
              ))
            )}
          </AccordionSection>

          {/* Section D: Common errors — default open */}
          <AccordionSection title={t('itemDetail.commonErrors')} defaultOpen>
            {(item.common_errors_ja ?? []).length === 0 ? (
              <p className="text-ink-muted">{t('itemDetail.none')}</p>
            ) : (
              (item.common_errors_ja ?? []).map((error) => (
                <div key={`${error.incorrect}-${error.correct}`} className="space-y-1 rounded-xl bg-paper p-3">
                  <p className="text-base">
                    <span className="font-medium text-red-700">❌ {error.incorrect}</span>
                  </p>
                  <p className="text-base">
                    <span className="font-medium text-emerald-700">✅ {error.correct}</span>
                  </p>
                  <p className="text-sm text-ink-muted">{error.why_ja}</p>
                </div>
              ))
            )}
          </AccordionSection>

          {/* Section E: Related words — default collapsed */}
          <AccordionSection title={t('itemDetail.relatedWords')} defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{t('itemDetail.synonyms')}</p>
                {(item.synonyms ?? []).length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('itemDetail.none')}</p>
                ) : (
                  (item.synonyms ?? []).map((syn) => (
                    <p key={syn.item} className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{syn.item}</span> — {syn.difference_ja}
                    </p>
                  ))
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{t('itemDetail.antonyms')}</p>
                {(item.antonyms ?? []).length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('itemDetail.none')}</p>
                ) : (
                  (item.antonyms ?? []).map((ant) => (
                    <p key={ant.item} className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{ant.item}</span> — {ant.difference_ja}
                    </p>
                  ))
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{t('itemDetail.hypernyms')}</p>
                {(item.hypernyms ?? []).length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('itemDetail.none')}</p>
                ) : (
                  <p className="text-sm text-ink">{(item.hypernyms ?? []).join(', ')}</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">{t('itemDetail.hyponyms')}</p>
                {(item.hyponyms ?? []).length === 0 ? (
                  <p className="text-sm text-ink-muted">{t('itemDetail.none')}</p>
                ) : (
                  <p className="text-sm text-ink">{(item.hyponyms ?? []).join(', ')}</p>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* Section F: Related uses — default collapsed */}
          <AccordionSection title={t('itemDetail.relatedUses')} defaultOpen={false}>
            {(item.related_uses ?? []).length === 0 ? (
              <p className="text-ink-muted">{t('itemDetail.none')}</p>
            ) : (
              (item.related_uses ?? []).map((use) => (
                <div key={use.form} className="rounded-xl bg-paper p-3">
                  <p className="text-lg font-semibold text-ink">{use.form}</p>
                  <p className="text-sm text-ink-muted">{use.meaning_ja}</p>
                  {use.metaphor_ja ? <p className="mt-1 text-xs text-ink-muted/80">{use.metaphor_ja}</p> : null}
                </div>
              ))
            )}
          </AccordionSection>

          {/* Section G: Meta — default collapsed */}
          <AccordionSection title={t('itemDetail.meta')} defaultOpen={false}>
            <dl className="grid grid-cols-1 gap-2 text-xs text-ink-muted sm:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">{t('review.fields.cefr')}</dt>
                <dd>{item.cefr_level}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{t('itemDetail.category')}</dt>
                <dd>{labelCategory(t, item.category)}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{t('itemDetail.frequency')}</dt>
                <dd>{item.frequency_rank_in_level}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{t('itemDetail.semanticField')}</dt>
                <dd>{item.semantic_field.join(', ')}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{t('itemDetail.skillFocus')}</dt>
                <dd>{item.skill_focus}</dd>
              </div>
              {item.collocation_pattern ? (
                <div>
                  <dt className="font-medium text-ink">{t('review.fields.collocationPattern')}</dt>
                  <dd>{item.collocation_pattern}</dd>
                </div>
              ) : null}
            </dl>
          </AccordionSection>
        </div>
      </div>
    </div>
  )
}
