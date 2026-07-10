import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { TargetSidePanel } from '@/features/train/components/TargetSidePanel'
import { ensureDatasetLoaded, getAllItems } from '@/lib/db'
import {
  getSeenPassageIndices,
  pickPassageIndex,
  pickRandomItemId,
  recordPassageSeen,
} from '@/lib/passage-history'
import { getContextOrNull, renderHighlightedPassage, filterEligibleTrainItems } from '@/lib/train/passage'
import { useSessionTimer } from '@/lib/train/use-session-timer'
import type { LearningItem } from '@/types/learning'

interface Round {
  item: LearningItem
  passageIndex: number
}

export function ModeAPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState<LearningItem[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [choice, setChoice] = useState<'ok' | 'hold' | null>(null)
  const [ready, setReady] = useState(false)
  const { label: timerLabel, reset: resetTimer } = useSessionTimer(true)

  const loadRound = useCallback(
    (pool: LearningItem[], excludeId?: string | null) => {
      const withContexts = filterEligibleTrainItems(pool)
      const nextId = pickRandomItemId(
        withContexts.map((item) => item.id),
        excludeId,
      )
      if (!nextId) {
        setRound(null)
        return
      }
      const item = withContexts.find((entry) => entry.id === nextId)!
      const passageIndex = pickPassageIndex(item.id, 'mode_a', item.contexts!.length)
      setRound({ item, passageIndex })
      setChoice(null)
      resetTimer()
    },
    [resetTimer],
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      await ensureDatasetLoaded()
      if (cancelled) return
      const all = await getAllItems()
      if (cancelled) return
      setItems(all)
      loadRound(all)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
    // Initial load only — loadRound is stable once resetTimer is memoized.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  const context = useMemo(() => {
    if (!round) return null
    return getContextOrNull(round.item, round.passageIndex)
  }, [round])

  const encounters = round ? getSeenPassageIndices(round.item.id, 'mode_a').length : 0

  const onNext = () => {
    if (!round || !choice) return
    recordPassageSeen(round.item.id, 'mode_a', round.passageIndex)
    loadRound(items, round.item.id)
  }

  if (!ready) {
    return <div className="grid h-full place-items-center font-sans text-text-muted">…</div>
  }

  if (!round || !context) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader cefrLabel="—" timerLabel={timerLabel} />
        <div className="grid flex-1 place-items-center p-6 text-center">
          <p className="font-sans text-text-secondary">{t('modeA.noContexts')}</p>
        </div>
        <AppFooter
          onPause={() => navigate('/')}
          pauseLabel={t('modeA.pause')}
          primaryLabel={t('modeA.next')}
          onPrimary={() => navigate('/train')}
        />
      </div>
    )
  }

  const parts = renderHighlightedPassage(context.text_en, context.target_span)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader cefrLabel={round.item.cefr_level} timerLabel={timerLabel} />

      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] md:grid-cols-[1fr_minmax(240px,30%)] md:grid-rows-1">
        <section className="overflow-auto px-5 py-8 md:px-10 md:py-12">
          <article className="mx-auto max-w-xl font-serif text-[19px] leading-relaxed text-text-primary md:text-[20px]">
            {parts.before}
            <mark className="chunk-highlight">{parts.target}</mark>
            {parts.after}
          </article>
        </section>

        <TargetSidePanel
          item={round.item}
          encounters={encounters}
          choice={choice}
          onOk={() => setChoice('ok')}
          onHold={() => setChoice('hold')}
        />
      </div>

      <AppFooter
        onPause={() => navigate('/')}
        pauseLabel={t('modeA.pause')}
        primaryLabel={t('modeA.next')}
        onPrimary={onNext}
        primaryDisabled={!choice}
      />
    </div>
  )
}
