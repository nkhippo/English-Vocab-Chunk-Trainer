import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

export type EvalChoice = 'ok' | 'hold' | null

interface EvalButtonsProps {
  choice: EvalChoice
  onOk: () => void
  onHold: () => void
  className?: string
}

export function EvalButtons({ choice, onOk, onHold, className }: EvalButtonsProps) {
  const { t } = useTranslation()

  return (
    <div className={`flex gap-3 ${className ?? ''}`}>
      <Button
        variant="ok"
        className={`min-h-12 flex-1 rounded-lg border-2 px-6 py-3 text-base ${
          choice === 'ok' ? 'bg-success text-bg-elevated' : ''
        }`}
        onClick={onOk}
      >
        ✓ OK
      </Button>
      <Button
        variant="hold"
        className={`min-h-12 flex-1 rounded-lg border-2 px-6 py-3 text-base ${
          choice === 'hold' ? 'bg-warning text-bg-elevated' : ''
        }`}
        onClick={onHold}
      >
        △ {t('train.hold')}
      </Button>
    </div>
  )
}
