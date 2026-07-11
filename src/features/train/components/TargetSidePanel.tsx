import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InsightCard } from '@/components/insight-card'
import { IpaTabs } from '@/components/ipa-tabs'
import { ConfusablesInline } from '@/features/train/components/ConfusablesInline'
import { EvalButtons, type EvalChoice } from '@/features/train/components/EvalButtons'
import { RelatedUsesInline } from '@/features/train/components/RelatedUsesInline'
import { TrainCheckmarks } from '@/features/train/components/TrainCheckmarks'
import type { Insight, LearningItem } from '@/types/learning'
import { getNeutralExample } from '@/lib/train/passage'
import { getInsightById, getSurfacesByIds } from '@/lib/db'

interface TargetSidePanelProps {
  item: LearningItem
  checkmarkMode: 'mode_a' | 'mode_b'
  choice: EvalChoice
  onOk: () => void
  onHold: () => void
  emptyHint?: string | null
  /** Show OK/Hold inside panel (md+). Mobile uses sticky bar outside. */
  showEvalInPanel?: boolean
}

export function TargetSidePanel({
  item,
  checkmarkMode,
  choice,
  onOk,
  onHold,
  emptyHint = null,
  showEvalInPanel = true,
}: TargetSidePanelProps) {
  const { t } = useTranslation()
  const example = getNeutralExample(item)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [relatedSurfaces, setRelatedSurfaces] = useState<string[]>([])
  const [showInsight, setShowInsight] = useState(false)

  useEffect(() => {
    setShowInsight(false)
    setInsight(null)
    setRelatedSurfaces([])
    if (!item.insight_id) return
    let cancelled = false
    void (async () => {
      const found = await getInsightById(item.insight_id!)
      if (cancelled || !found) return
      setInsight(found)
      if (found.related_items?.length) {
        setRelatedSurfaces(await getSurfacesByIds(found.related_items))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [item.id, item.insight_id])

  useEffect(() => {
    if (choice !== 'hold' || !insight) {
      setShowInsight(false)
      return
    }
    const timer = window.setTimeout(() => setShowInsight(true), 2000)
    return () => window.clearTimeout(timer)
  }, [choice, insight])

  if (emptyHint) {
    return (
      <aside className="flex flex-col border-t border-border bg-bg-panel p-5 md:h-full md:border-l md:border-t-0 md:overflow-y-auto">
        <p className="font-sans text-sm leading-relaxed text-text-muted">{emptyHint}</p>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col border-t border-border bg-bg-panel p-5 md:h-full md:border-l md:border-t-0 md:overflow-y-auto">
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold leading-tight text-text-primary md:text-[28px]">
            {item.surface}
          </h2>
          <IpaTabs careful={item.ipa_careful} connected={item.ipa_connected} />
          <p className="font-sans text-base text-text-primary">{item.translations_ja[0]}</p>
        </div>

        {example?.en || example?.ja ? (
          <section className="space-y-2">
            <h3 className="font-serif text-[15px] font-medium text-text-primary">
              {t('itemDetail.exampleLabel')}
            </h3>
            {example.en ? (
              <p className="font-sans text-sm leading-snug text-text-primary">{example.en}</p>
            ) : null}
            {example.ja ? (
              <p className="font-sans text-sm leading-snug text-text-secondary">{example.ja}</p>
            ) : null}
          </section>
        ) : null}

        <ConfusablesInline item={item} limit={3} />
        <RelatedUsesInline item={item} limit={3} />
        <TrainCheckmarks itemId={item.id} mode={checkmarkMode} />

        {showInsight && insight ? (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <InsightCard
              insight={insight}
              relatedSurfaces={relatedSurfaces}
              onClose={() => setShowInsight(false)}
            />
          </div>
        ) : null}
      </div>

      {showEvalInPanel ? (
        <div className="mt-auto hidden pt-8 md:block">
          <EvalButtons choice={choice} onOk={onOk} onHold={onHold} />
        </div>
      ) : null}
    </aside>
  )
}
