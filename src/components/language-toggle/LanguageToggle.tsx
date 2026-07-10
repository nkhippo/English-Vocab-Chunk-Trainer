import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'

export function LanguageToggle() {
  const { t } = useTranslation()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  return (
    <div className="inline-flex gap-1 rounded-[12px] bg-paper-soft p-[5px] text-sm">
      <button
        type="button"
        className={`rounded-[9px] px-3.5 py-2 font-bold transition ${
          language === 'ja' ? 'bg-paper-elevated text-ink shadow-soft' : 'bg-transparent text-ink-muted'
        }`}
        onClick={() => setLanguage('ja')}
      >
        {t('settings.languageJa')}
      </button>
      <button
        type="button"
        className={`rounded-[9px] px-3.5 py-2 font-bold transition ${
          language === 'en' ? 'bg-paper-elevated text-ink shadow-soft' : 'bg-transparent text-ink-muted'
        }`}
        onClick={() => setLanguage('en')}
      >
        {t('settings.languageEn')}
      </button>
    </div>
  )
}
