import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { InsightCard } from '@/components/insight-card'
import { IpaTabs } from '@/components/ipa-tabs'
import type { Insight, LearningItem } from '@/types/learning'
import { formatEncounterLabel, getNeutralExample } from '@/lib/train/passage'
import { useAppStore } from '@/lib/stores/app-store'
import { getInsightById, getSurfacesByIds } from '@/lib/db'

type EvalChoice = 'ok' | 'hold' | null

interface TargetSidePanelProps {
  item: LearningItem
  encounters: number
  choice: EvalChoice
  onOk: () => void
  onHold: () => void
  emptyHint?: string | null
}

export function TargetSidePanel({
  item,
  encounters,
  choice,
  onOk,
  onHold,
  emptyHint = null,
}: TargetSidePanelProps) {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
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
      <aside className="flex h-full flex-col border-t border-border bg-bg-panel p-5 md:border-l md:border-t-0">
        <p className="font-sans text-sm leading-relaxed text-text-muted">{emptyHint}</p>
      </aside>
    )
  }

  return (
    <aside className="flex h-full flex-col border-t border-border bg-bg-panel p-5 md:border-l md:border-t-0">
      <div className="space-y-3">
        <h2 className="font-serif text-[26px] leading-tight text-text-primary">{item.surface}</h2>
        <IpaTabs careful={item.ipa_careful} connected={item.ipa_connected} />
        <p className="font-sans text-base text-text-primary">{item.translations_ja[0]}</p>
        {example ? <p className="font-sans text-sm text-text-muted">e.g. {example.ja}</p> : null}
        <p className="font-sans text-xs text-text-muted">
          {formatEncounterLabel(item.cefr_level, encounters, language)}
        </p>
      </div>

      {showInsight && insight ? (
        <div className="mt-4 animate-[fadeIn_0.4s_ease-out]">
          <InsightCard
            insight={insight}
            relatedSurfaces={relatedSurfaces}
            onClose={() => setShowInsight(false)}
          />
        </div>
      ) : null}

      <div className="mt-auto flex gap-3 pt-8">
        <Button
          variant="ok"
          className={choice === 'ok' ? 'bg-success text-bg-elevated' : ''}
          onClick={onOk}
        >
          ✓ OK
        </Button>
        <Button
          variant="hold"
          className={choice === 'hold' ? 'bg-warning text-bg-elevated' : ''}
          onClick={onHold}
        >
          △ {t('train.hold')}
        </Button>
      </div>
    </aside>
  )
}
