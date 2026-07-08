import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/language-toggle/LanguageToggle'
import { useAppStore } from '@/lib/stores/app-store'

export function SettingsPage() {
  const { t } = useTranslation()
  const reopenGuide = useAppStore((s) => s.reopenGuide)

  return (
    <section className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-3xl font-bold">{t('settings.title')}</h1>

      <div className="rounded-3xl border border-line bg-paper-elevated p-6">
        <p className="mb-3 text-sm font-medium text-ink-muted">{t('settings.language')}</p>
        <LanguageToggle />
      </div>

      <div className="rounded-3xl border border-line bg-paper-elevated p-6">
        <button
          type="button"
          onClick={reopenGuide}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
        >
          {t('settings.guide')}
        </button>
      </div>

      <div className="rounded-3xl border border-line bg-paper-elevated p-6">
        <h2 className="font-semibold">{t('settings.about')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t('settings.aboutBody')}</p>
      </div>
    </section>
  )
}
