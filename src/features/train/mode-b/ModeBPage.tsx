import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { EvalButtons, type EvalChoice } from '@/features/train/components/EvalButtons'
import { TargetSidePanel } from '@/features/train/components/TargetSidePanel'
import { useTrainInteractions } from '@/features/train/hooks/useTrainInteractions'
import { ensureDatasetLoaded, getAllItems } from '@/lib/db'
import { pickPassageIndex, pickRandomItemId, recordPassageSeen } from '@/lib/passage-history'
import {
  generateClozeSegments,
  getContextOrNull,
  renderHighlightedPassage,
  filterEligibleTrainItems,
} from '@/lib/train/passage'
import type { LearningItem } from '@/types/learning'

interface Round {
  item: LearningItem
  passageIndex: number
}

export function ModeBPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const swipeRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<LearningItem[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [choice, setChoice] = useState<EvalChoice>(null)
  const [ready, setReady] = useState(false)
  const [fading, setFading] = useState(false)

  const loadRound = useCallback((pool: LearningItem[], excludeId?: string | null) => {
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
    const passageIndex = pickPassageIndex(item.id, 'mode_b', item.contexts!.length)
    setRound({ item, passageIndex })
    setRevealed(false)
    setChoice(null)
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  const context = useMemo(() => {
    if (!round) return null
    return getContextOrNull(round.item, round.passageIndex)
  }, [round])

  const toggleOk = useCallback(() => {
    if (!revealed) return
    setChoice((prev) => (prev === 'ok' ? null : 'ok'))
  }, [revealed])

  const toggleHold = useCallback(() => {
    if (!revealed) return
    setChoice((prev) => (prev === 'hold' ? null : 'hold'))
  }, [revealed])

  const onReveal = useCallback(() => {
    setRevealed(true)
  }, [])

  const onNext = useCallback(() => {
    if (!round || !choice || fading) return
    setFading(true)
    window.setTimeout(() => {
      recordPassageSeen(round.item.id, 'mode_b', round.passageIndex)
      loadRound(items, round.item.id)
      setFading(false)
    }, 150)
  }, [round, choice, fading, items, loadRound])

  const onPrimary = () => {
    if (!revealed) {
      onReveal()
      return
    }
    onNext()
  }

  useTrainInteractions({
    enabled: ready && Boolean(round && context),
    canAdvance: revealed && Boolean(choice) && !fading,
    canReveal: !revealed,
    onOk: toggleOk,
    onHold: toggleHold,
    onAdvance: onNext,
    onReveal,
    swipeTargetRef: swipeRef,
  })

  if (!ready) {
    return <div className="grid h-full place-items-center font-sans text-text-muted">…</div>
  }

  if (!round || !context) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader showClose onClose={() => navigate('/')} />
        <div className="grid flex-1 place-items-center p-6 text-center">
          <p className="font-sans text-text-secondary">{t('modeB.noContexts')}</p>
        </div>
        <AppFooter primaryLabel={t('modeB.next')} onPrimary={() => navigate('/train')} />
      </div>
    )
  }

  const clozeSegments = generateClozeSegments(context.text_en, context.cloze_spans)
  const revealedParts = renderHighlightedPassage(context.text_en, context.target_span)
  const roundKey = `${round.item.id}-${round.passageIndex}`

  return (
    <div className="flex h-full min-h-0 flex-col">
      <AppHeader showClose onClose={() => navigate('/')} />

      <div
        ref={swipeRef}
        className={`min-h-0 flex-1 overflow-y-auto transition-opacity duration-300 md:grid md:grid-cols-[3fr_2fr] md:overflow-hidden ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <section
          key={`passage-${roundKey}`}
          className="animate-[fadeIn_0.3s_ease-out] space-y-8 px-5 py-6 md:overflow-y-auto md:px-10 md:py-12"
        >
          <div className="mx-auto max-w-xl">
            <p className="font-serif text-[17px] leading-[1.7] text-text-primary md:text-[18px]">
              {context.text_ja}
            </p>
          </div>
          <div className="mx-auto max-w-xl border-t border-border pt-8">
            {revealed ? (
              <article className="font-serif text-[17px] leading-[1.7] text-text-primary md:text-[19px] md:leading-relaxed">
                {revealedParts.before}
                <mark className="chunk-highlight">{revealedParts.target}</mark>
                {revealedParts.after}
              </article>
            ) : (
              <article className="font-serif text-[17px] leading-[1.7] text-text-primary md:text-[19px] md:leading-relaxed">
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
          key={`panel-${roundKey}`}
          item={round.item}
          checkmarkMode="mode_b"
          choice={choice}
          onOk={toggleOk}
          onHold={toggleHold}
          emptyHint={revealed ? null : t('modeB.sideHint')}
        />
      </div>

      {/* Mobile sticky actions */}
      <div className="shrink-0 space-y-3 border-t border-border bg-bg-base px-4 py-3 md:hidden">
        {revealed ? <EvalButtons choice={choice} onOk={toggleOk} onHold={toggleHold} /> : null}
        <Button
          variant="primary"
          className="min-h-14 w-full rounded-xl px-8 py-4 text-base"
          onClick={onPrimary}
          disabled={revealed && (!choice || fading)}
        >
          {revealed ? t('modeB.next') : t('modeB.reveal')}
        </Button>
      </div>

      {/* Desktop: eval in panel; reveal/next in footer */}
      <AppFooter
        className="hidden md:flex"
        primaryLabel={revealed ? t('modeB.next') : t('modeB.reveal')}
        onPrimary={onPrimary}
        primaryDisabled={revealed && (!choice || fading)}
      />
    </div>
  )
}
