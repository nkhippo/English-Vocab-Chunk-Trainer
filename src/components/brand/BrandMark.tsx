import { useTranslation } from 'react-i18next'

function LoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 38 38" aria-hidden="true">
      <g stroke="var(--color-accent)" strokeWidth="3">
        <line x1="8" y1="4" x2="8" y2="34" />
        <line x1="16" y1="4" x2="16" y2="34" />
        <line x1="24" y1="4" x2="24" y2="34" />
        <line x1="32" y1="4" x2="32" y2="34" />
      </g>
      <g stroke="var(--color-brand)" strokeWidth="3">
        <line x1="4" y1="9" x2="34" y2="9" />
        <line x1="4" y1="17" x2="34" y2="17" />
        <line x1="4" y1="25" x2="34" y2="25" />
        <line x1="4" y1="33" x2="34" y2="33" />
      </g>
    </svg>
  )
}

interface BrandMarkProps {
  /** Smaller wordmark for tight headers */
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className = '' }: BrandMarkProps) {
  const { t } = useTranslation()

  return (
    <div className={`flex items-end gap-3.5 ${className}`}>
      <LoomIcon className={compact ? 'size-8 shrink-0' : 'size-[38px] shrink-0'} />
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink-muted">{t('app.eyebrow')}</p>
        <p
          className={`relative inline-block font-extrabold tracking-tight text-ink ${
            compact ? 'text-base' : 'text-[21px]'
          }`}
        >
          {t('app.wordmark')}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-1 h-[3px] rounded-sm bg-[linear-gradient(90deg,var(--color-accent)_0_50%,var(--color-brand)_50%_100%)]"
          />
        </p>
      </div>
    </div>
  )
}
