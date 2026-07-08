import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'

export function LanguageToggle() {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line bg-paper-elevated text-sm">
      <button
        type="button"
        className={`px-3 py-1.5 ${language === 'ja' ? 'bg-brand text-white' : 'text-ink-muted'}`}
        onClick={() => setLanguage('ja')}
      >
        {t('settings.languageJa')}
      </button>
      <button
        type="button"
        className={`px-3 py-1.5 ${language === 'en' ? 'bg-brand text-white' : 'text-ink-muted'}`}
        onClick={() => setLanguage('en')}
      >
        {t('settings.languageEn')}
      </button>
    </div>
  )
}
