import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'

export function LanguageToggle() {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  return (
    <div className="inline-flex gap-1 rounded border border-border bg-bg-panel p-1 text-sm">
      <button
        type="button"
        className={`rounded px-3.5 py-2 font-sans font-medium transition ${
          language === 'ja' ? 'bg-bg-elevated text-text-primary' : 'bg-transparent text-text-muted'
        }`}
        onClick={() => setLanguage('ja')}
      >
        {t('settings.languageJa')}
      </button>
      <button
        type="button"
        className={`rounded px-3.5 py-2 font-sans font-medium transition ${
          language === 'en' ? 'bg-bg-elevated text-text-primary' : 'bg-transparent text-text-muted'
        }`}
        onClick={() => setLanguage('en')}
      >
        {t('settings.languageEn')}
      </button>
    </div>
  )
}
