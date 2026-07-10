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
import { generateClozeSegments, getContextOrNull, renderHighlightedPassage } from '@/lib/train/passage'
import { useSessionTimer } from '@/lib/train/use-session-timer'
import type { LearningItem } from '@/types/learning'

interface Round {
  item: LearningItem
  passageIndex: number
}

export function ModeBPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState<LearningItem[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [choice, setChoice] = useState<'ok' | 'hold' | null>(null)
  const [ready, setReady] = useState(false)
  const { label: timerLabel, reset: resetTimer } = useSessionTimer(true)

  const loadRound = useCallback(
    (pool: LearningItem[], excludeId?: string | null) => {
      const withContexts = pool.filter((item) => (item.contexts?.length ?? 0) > 0)
      const nextId = pickRandomItemId(
        withContexts.map((item) => item.id),
        excludeId,
      )
      if (!nextId) {
        setRound(null)
        return
      }
      const item = withContexts.find((entry) => entry.id === nextId)!
      const passageIndex = pickPassageIndex(item.id, 'mode_b', item.contexts!.length)
      setRound({ item, passageIndex })
      setRevealed(false)
      setChoice(null)
      resetTimer()
    },
    [resetTimer],
  )

  useEffect(() => {
    void (async () => {
      await ensureDatasetLoaded()
      const all = await getAllItems()
      setItems(all)
      loadRound(all)
      setReady(true)
    })()
  }, [loadRound])

  const context = useMemo(() => {
    if (!round) return null
    return getContextOrNull(round.item, round.passageIndex)
  }, [round])

  const encounters = round ? getSeenPassageIndices(round.item.id, 'mode_b').length : 0

  const onPrimary = () => {
    if (!round) return
    if (!revealed) {
      setRevealed(true)
      return
    }
    if (!choice) return
    recordPassageSeen(round.item.id, 'mode_b', round.passageIndex)
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
          <p className="font-sans text-text-secondary">{t('modeB.noContexts')}</p>
        </div>
        <AppFooter
          onPause={() => navigate('/')}
          pauseLabel={t('modeB.pause')}
          primaryLabel={t('modeB.next')}
          onPrimary={() => navigate('/train')}
        />
      </div>
    )
  }

  const clozeSegments = generateClozeSegments(context.text_en, context.cloze_spans)
  const revealedParts = renderHighlightedPassage(context.text_en, context.target_span)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader cefrLabel={round.item.cefr_level} timerLabel={timerLabel} />

      <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] md:grid-cols-[1fr_minmax(240px,30%)] md:grid-rows-1">
        <section className="space-y-8 overflow-auto px-5 py-8 md:px-10 md:py-12">
          <div className="mx-auto max-w-xl">
            <p className="font-serif text-[18px] leading-relaxed text-text-primary">{context.text_ja}</p>
          </div>
          <div className="mx-auto max-w-xl border-t border-border pt-8">
            {revealed ? (
              <article className="font-serif text-[19px] leading-relaxed text-text-primary md:text-[20px]">
                {revealedParts.before}
                <mark className="chunk-highlight">{revealedParts.target}</mark>
                {revealedParts.after}
              </article>
            ) : (
              <article className="font-serif text-[19px] leading-relaxed text-text-primary md:text-[20px]">
                {clozeSegments.map((segment, index) =>
                  segment.type === 'blank' ? (
                    <span key={`b-${index}`} className="cloze-blank">
                      {segment.value}
                    </span>
                  ) : (
                    <span key={`t-${index}`}>{segment.value}</span>
                  ),
                )}
              </article>
            )}
          </div>
        </section>

        <TargetSidePanel
          item={round.item}
          encounters={encounters}
          choice={choice}
          onOk={() => setChoice('ok')}
          onHold={() => setChoice('hold')}
          emptyHint={revealed ? null : t('modeB.sideHint')}
        />
      </div>

      <AppFooter
        onPause={() => navigate('/')}
        pauseLabel={t('modeB.pause')}
        primaryLabel={revealed ? t('modeB.next') : t('modeB.reveal')}
        onPrimary={onPrimary}
        primaryDisabled={revealed && !choice}
        primaryVariant="primary"
      />
    </div>
  )
}
