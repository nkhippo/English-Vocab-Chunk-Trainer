import { useTranslation } from 'react-i18next'

interface DetailToggleButtonProps {
  open: boolean
  onToggle: () => void
  className?: string
}

/** Compact header control to show/hide the item detail panel. */
export function DetailToggleButton({ open, onToggle, className = '' }: DetailToggleButtonProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      aria-pressed={open}
      aria-label={open ? t('modeA.hideDetail') : t('modeA.showDetail')}
      className={`grid size-10 place-items-center rounded text-text-secondary hover:text-text-primary ${className}`}
      onClick={onToggle}
    >
      <span className="font-sans text-lg leading-none" aria-hidden>
        {open ? '◉' : '◎'}
      </span>
    </button>
  )
}
