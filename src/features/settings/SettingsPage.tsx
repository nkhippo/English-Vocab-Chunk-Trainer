import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/language-toggle/LanguageToggle'
import { useAppStore } from '@/lib/stores/app-store'

export function SettingsPage() {
  const { t } = useTranslation()
  const reopenGuide = useAppStore((s) => s.reopenGuide)

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-3xl font-bold">{t('settings.title')}</h1>

      <div className="rounded-[14px] border border-line bg-paper-elevated p-5 shadow-soft">
        <p className="mb-3 text-sm font-bold text-ink-muted">{t('settings.language')}</p>
        <LanguageToggle />
      </div>

      <div className="rounded-[14px] border border-line bg-paper-elevated p-5 shadow-soft">
        <button
          type="button"
          onClick={reopenGuide}
          className="rounded-[11px] bg-brand px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-brand-strong hover:shadow-soft"
        >
          {t('settings.guide')}
        </button>
      </div>

      <div className="rounded-[14px] border border-line bg-paper-elevated p-5 shadow-soft">
        <h2 className="font-bold">{t('settings.about')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t('settings.aboutBody')}</p>
      </div>
    </section>
  )
}
