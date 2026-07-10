import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ItemDetailModal } from '@/components/item-detail-modal'
import { CheckmarkRow } from '@/components/checkmark-row'
import { useCheckmark } from '@/lib/checkmarks'
import { ensureDatasetLoaded } from '@/lib/db'
import { buildModeAChoices, pickWeightedItem, type DistractorMode } from '@/lib/quiz'
import type { LearningItem } from '@/types/learning'

function ModeACheckmarks({ itemId }: { itemId: string }) {
  const { t } = useTranslation()
  const [count, setCount] = useCheckmark('mode_a', itemId)

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-ink-muted">{t('checkmarks.recordUnderstanding')}</span>
      <CheckmarkRow
        count={count}
        onChange={setCount}
        size="lg"
        ariaLabel={t('checkmarks.recordUnderstanding')}
      />
    </div>
  )
}

export function ModeAPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<LearningItem[]>([])
  const [ready, setReady] = useState(false)
  const [current, setCurrent] = useState<LearningItem | null>(null)
  const [distractorMode, setDistractorMode] = useState<DistractorMode>('confusables')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)
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
      const next = pickWeightedItem(items, 'mode_a', excludeId)
      setCurrent(next)
      setSelectedIndex(null)
    },
    [items],
  )

  useEffect(() => {
    if (ready && items.length > 0 && !current) {
      loadQuestion()
    }
  }, [ready, items, current, loadQuestion])

  const { choices, correctIndex } = useMemo(() => {
    if (!current) return { choices: [] as string[], correctIndex: -1 }
    return buildModeAChoices(current, items, distractorMode)
  }, [current, items, distractorMode])

  const answered = selectedIndex !== null

  const toggleDistractor = () => {
    setDistractorMode((mode) => (mode === 'confusables' ? 'random' : 'confusables'))
    setSelectedIndex(null)
  }

  const onSelect = (index: number) => {
    if (answered || !current) return
    setSelectedIndex(index)
    if (index === correctIndex) {
      setStreak((value) => value + 1)
    } else {
      setStreak(0)
    }
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

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/train" className="text-sm font-medium text-brand hover:underline">
            ← {t('train.title')}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold">{t('modeA.title')}</h1>
        </div>
        <button
          type="button"
          onClick={toggleDistractor}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
            distractorMode === 'confusables'
              ? 'bg-brand text-white'
              : 'border border-line bg-paper-elevated text-ink-muted'
          }`}
        >
          {distractorMode === 'confusables' ? t('modeA.distractorConfusables') : t('modeA.distractorRandom')}
        </button>
      </div>

      {streak > 0 ? (
        <p className="text-sm font-medium text-brand">{t('modeA.streak', { count: streak })}</p>
      ) : null}

      <div className="rounded-3xl border border-line bg-paper-elevated p-6 text-center">
        <p className="font-display text-3xl font-bold text-ink">{current.surface}</p>
        <p className="mt-2 font-mono text-base text-ink-muted">{current.ipa_careful}</p>
      </div>

      <p className="text-center text-lg font-medium text-ink">{t('modeA.prompt')}</p>

      <div className="space-y-3">
        {choices.map((choice, index) => {
          const isSelected = selectedIndex === index
          const isCorrect = index === correctIndex
          let className = 'w-full rounded-2xl border px-4 py-4 text-left text-lg transition '
          if (!answered) {
            className += 'border-line bg-paper-elevated hover:border-brand hover:bg-brand-soft/40'
          } else if (isCorrect) {
            className += 'border-emerald-500 bg-emerald-50 text-emerald-900'
          } else if (isSelected) {
            className += 'border-red-400 bg-red-50 text-red-900'
          } else {
            className += 'border-line bg-paper text-ink-muted opacity-70'
          }

          return (
            <button key={`${choice}-${index}`} type="button" className={className} onClick={() => onSelect(index)}>
              {choice}
            </button>
          )
        })}
      </div>

      {answered ? (
        <div className="space-y-3 rounded-2xl border border-line bg-paper p-4 text-center">
          <p className="text-xl font-semibold">
            {selectedIndex === correctIndex ? t('modeA.correct') : t('modeA.incorrect')}
          </p>
          <ModeACheckmarks itemId={current.id} />
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
      ) : null}

      <ItemDetailModal item={current} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </section>
  )
}
