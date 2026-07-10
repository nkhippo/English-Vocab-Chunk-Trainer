import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ItemDetailModal } from '@/components/item-detail-modal'
import { ensureDatasetLoaded } from '@/lib/db'
import { pickRandomItem } from '@/lib/quiz'
import type { LearningItem } from '@/types/learning'

export type HintLevel = 1 | 2 | 3

function exampleForReveal(item: LearningItem) {
  return (
    item.example_sentences.find((ex) => ex.register === 'neutral') ?? item.example_sentences[0] ?? null
  )
}

export function ModeBPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<LearningItem[]>([])
  const [ready, setReady] = useState(false)
  const [current, setCurrent] = useState<LearningItem | null>(null)
  const [hintLevel, setHintLevel] = useState<HintLevel>(1)
  const [revealed, setRevealed] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const dataset = await ensureDatasetLoaded()
      setItems(dataset.items)
      setReady(true)
    })()
  }, [])

  const loadQuestion = useCallback(
    (excludeId?: string) => {
      if (items.length === 0) return
      const next = pickRandomItem(items, excludeId)
      setCurrent(next)
      setRevealed(false)
    },
    [items],
  )

  useEffect(() => {
    if (ready && items.length > 0 && !current) {
      loadQuestion()
    }
  }, [ready, items, current, loadQuestion])

  const cycleHintLevel = () => {
    setHintLevel((level) => (level === 3 ? 1 : ((level + 1) as HintLevel)))
  }

  const onNext = () => {
    if (!current) return
    loadQuestion(current.id)
  }

  if (!ready) {
    return <p className="text-lg text-ink-muted">…</p>
  }

  if (!current) {
    return <p className="text-lg text-ink-muted">{t('browse.empty')}</p>
  }

  const example = exampleForReveal(current)

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/train" className="text-sm font-medium text-brand hover:underline">
            ← {t('train.title')}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold">{t('modeB.title')}</h1>
        </div>
        <button
          type="button"
          onClick={cycleHintLevel}
          className="shrink-0 rounded-full border border-line bg-paper-elevated px-3 py-1.5 text-xs font-medium text-ink-muted"
        >
          {t(`modeB.hintLevel${hintLevel}`)}
        </button>
      </div>

      <div className="rounded-3xl border border-line bg-paper-elevated p-6">
        <p className="text-2xl font-semibold leading-relaxed text-ink">{current.translations_ja.join('、')}</p>
        {hintLevel >= 2 && current.definition_en ? (
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{current.definition_en}</p>
        ) : null}
        {hintLevel >= 3 && current.semantic_field.length > 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            {t('itemDetail.semanticField')}: {current.semantic_field.join(', ')}
          </p>
        ) : null}
      </div>

      <p className="text-center text-lg font-medium text-ink">{t('modeB.prompt')}</p>

      {!revealed ? (
        <button
          type="button"
          className="w-full rounded-2xl border border-dashed border-brand bg-brand-soft/30 px-4 py-5 text-lg font-medium text-brand-strong hover:bg-brand-soft/50"
          onClick={() => setRevealed(true)}
        >
          {t('modeB.reveal')}
        </button>
      ) : (
        <div className="space-y-4 rounded-3xl border border-line bg-paper p-6 text-center">
          <p className="font-display text-3xl font-bold text-ink">{current.surface}</p>
          <p className="font-mono text-base text-ink-muted">{current.ipa_careful}</p>
          {example ? (
            <div className="rounded-2xl bg-paper-elevated p-4 text-left">
              <p className="text-lg text-ink">{example.en}</p>
              <p className="mt-2 text-base text-ink-muted">{example.ja}</p>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium hover:bg-paper-elevated"
              onClick={() => setDetailOpen(true)}
            >
              {t('modeA.viewDetail')}
            </button>
            <button
              type="button"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
              onClick={onNext}
            >
              {t('modeA.next')}
            </button>
          </div>
        </div>
      )}

      <ItemDetailModal item={current} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </section>
  )
}
