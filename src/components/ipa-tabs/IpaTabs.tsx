import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IpaTabsProps {
  careful: string
  connected?: string | null
  className?: string
}

export function IpaTabs({ careful, connected, className }: IpaTabsProps) {
  const { t } = useTranslation()
  const hasConnected = Boolean(connected)
  const [tab, setTab] = useState<'careful' | 'connected'>('careful')
  const active = hasConnected && tab === 'connected' ? connected! : careful

  return (
    <div className={className}>
      {hasConnected ? (
        <div className="mb-2 flex gap-1" role="tablist" aria-label={t('ipa.tabsLabel')}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'careful'}
            className={`rounded px-3 py-1 font-sans text-xs font-medium ${
              tab === 'careful'
                ? 'bg-accent text-bg-elevated'
                : 'border border-border text-text-secondary'
            }`}
            onClick={() => setTab('careful')}
          >
            {t('ipa.careful')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'connected'}
            className={`rounded px-3 py-1 font-sans text-xs font-medium ${
              tab === 'connected'
                ? 'bg-accent text-bg-elevated'
                : 'border border-border text-text-secondary'
            }`}
            onClick={() => setTab('connected')}
          >
            {t('ipa.connected')}
          </button>
        </div>
      ) : null}
      <p className="ipa text-base text-text-secondary">{active}</p>
    </div>
  )
}
