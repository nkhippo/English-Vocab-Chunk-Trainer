import { Button } from '@/components/ui/Button'
import type { LearningItem } from '@/types/learning'
import { formatEncounterLabel, getNeutralExample } from '@/lib/train/passage'
import { useAppStore } from '@/lib/stores/app-store'

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
  const language = useAppStore((s) => s.language)
  const example = getNeutralExample(item)

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
        <p className="ipa text-base text-text-secondary">{item.ipa_careful}</p>
        <p className="font-sans text-base text-text-primary">{item.translations_ja[0]}</p>
        {example ? <p className="font-sans text-sm text-text-muted">e.g. {example.ja}</p> : null}
        <p className="font-sans text-xs text-text-muted">
          {formatEncounterLabel(item.cefr_level, encounters, language)}
        </p>
      </div>

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
          △ 保留
        </Button>
      </div>
    </aside>
  )
}
