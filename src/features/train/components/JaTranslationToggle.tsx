import { useTranslation } from 'react-i18next'

interface JaTranslationToggleProps {
  open: boolean
  onToggle: () => void
  textJa: string
}

/** Subtle control under the English passage to reveal Japanese. */
export function JaTranslationToggle({ open, onToggle, textJa }: JaTranslationToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        className="font-sans text-sm text-text-muted underline decoration-border underline-offset-4 hover:text-text-secondary"
        onClick={onToggle}
      >
        {open ? t('modeA.hideJa') : t('modeA.showJa')}
      </button>
      {open ? (
        <p className="animate-[fadeIn_0.3s_ease-out] font-sans text-sm leading-relaxed text-text-secondary md:text-base">
          {textJa}
        </p>
      ) : null}
    </div>
  )
}
