import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { JaTranslationToggle } from '@/features/train/components/JaTranslationToggle'
import { TargetSidePanel } from '@/features/train/components/TargetSidePanel'
import { useTrainInteractions } from '@/features/train/hooks/useTrainInteractions'
import { ensureDatasetLoaded, getAllItems } from '@/lib/db'
import { pickPassageIndex, pickRandomItemId, recordPassageSeen } from '@/lib/passage-history'
import { getContextOrNull, renderHighlightedPassage, filterEligibleTrainItems } from '@/lib/train/passage'
import type { LearningItem } from '@/types/learning'

interface Round {
  item: LearningItem
  passageIndex: number
}

export function ModeAPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const swipeRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<LearningItem[]>([])
  const [round, setRound] = useState<Round | null>(null)
  const [ready, setReady] = useState(false)
  const [fading, setFading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [jaOpen, setJaOpen] = useState(false)

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
    const passageIndex = pickPassageIndex(item.id, 'mode_a', item.contexts!.length)
    setRound({ item, passageIndex })
    setDetailOpen(false)
    setJaOpen(false)
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

  const onNext = useCallback(() => {
    if (!round || fading) return
    setFading(true)
    window.setTimeout(() => {
      recordPassageSeen(round.item.id, 'mode_a', round.passageIndex)
      loadRound(items, round.item.id)
      setFading(false)
    }, 150)
  }, [round, fading, items, loadRound])

  useTrainInteractions({
    enabled: ready && Boolean(round && context),
    canAdvance: !fading,
    onAdvance: onNext,
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
          <p className="font-sans text-text-secondary">{t('modeA.noContexts')}</p>
        </div>
        <AppFooter primaryLabel={t('modeA.next')} onPrimary={() => navigate('/train')} />
      </div>
    )
  }

  const parts = renderHighlightedPassage(context.text_en, context.target_span)
  const roundKey = `${round.item.id}-${round.passageIndex}`

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <AppHeader
        showClose
        onClose={() => navigate('/')}
        showDetailToggle
        detailOpen={detailOpen}
        onDetailToggle={() => setDetailOpen((value) => !value)}
      />

      <div
        ref={swipeRef}
        className={`min-h-0 flex-1 overflow-y-auto transition-opacity duration-300 md:overflow-hidden ${
          fading ? 'opacity-0' : 'opacity-100'
        } ${detailOpen ? 'md:grid md:grid-cols-[3fr_2fr]' : ''}`}
      >
        <section
          key={`passage-${roundKey}`}
          className="animate-[fadeIn_0.3s_ease-out] px-5 py-6 md:h-full md:overflow-y-auto md:px-10 md:py-12"
        >
          <div className="mx-auto max-w-xl">
            <article className="font-serif text-[17px] leading-[1.7] text-text-primary md:text-[19px] md:leading-relaxed">
              {parts.before}
              <mark className="chunk-highlight">{parts.target}</mark>
              {parts.after}
            </article>
            <JaTranslationToggle
              open={jaOpen}
              onToggle={() => setJaOpen((value) => !value)}
              textJa={context.text_ja}
            />
          </div>
        </section>

        {/* Desktop side panel */}
        {detailOpen ? (
          <div className="hidden h-full min-h-0 animate-[fadeIn_0.3s_ease-out] border-l border-border md:block">
            <TargetSidePanel item={round.item} onClose={() => setDetailOpen(false)} />
          </div>
        ) : null}
      </div>

      {/* Mobile drawer */}
      {detailOpen ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label={t('modeA.hideDetail')}
            className="fixed inset-0 z-40 bg-text-primary/20"
            onClick={() => setDetailOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-[min(100%,22rem)] animate-[fadeIn_0.3s_ease-out] shadow-lg">
            <TargetSidePanel item={round.item} onClose={() => setDetailOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-border bg-bg-base px-4 py-3 md:hidden">
        <Button
          variant="primary"
          className="min-h-14 w-full rounded-xl px-8 py-4 text-base"
          onClick={onNext}
          disabled={fading}
        >
          {t('modeA.next')}
        </Button>
      </div>

      <AppFooter
        className="hidden md:flex"
        primaryLabel={t('modeA.next')}
        onPrimary={onNext}
        primaryDisabled={fading}
      />
    </div>
  )
}
