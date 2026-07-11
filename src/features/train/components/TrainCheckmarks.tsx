import { useTranslation } from 'react-i18next'
import { CheckmarkRow } from '@/components/checkmark-row'
import { useCheckmark, type CheckmarkMode } from '@/lib/checkmarks'

interface TrainCheckmarksProps {
  itemId: string
  mode: Extract<CheckmarkMode, 'mode_a' | 'mode_b'>
}

/**
 * Display-only learning-history boxes for Mode A/B.
 * Interaction is deferred — see doc/handoff/v8-scope-questions.md.
 */
export function TrainCheckmarks({ itemId, mode }: TrainCheckmarksProps) {
  const { t } = useTranslation()
  const [count] = useCheckmark(mode, itemId)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-sans text-sm font-medium text-text-secondary">
        {t('checkmarks.learningHistory')}
      </span>
      <CheckmarkRow
        count={count}
        onChange={() => undefined}
        size="md"
        disabled
        ariaLabel={t('checkmarks.learningHistory')}
      />
    </div>
  )
}
