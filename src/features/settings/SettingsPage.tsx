import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '@/components/language-toggle/LanguageToggle'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/stores/app-store'

export function SettingsPage() {
  const { t } = useTranslation()
  const reopenGuide = useAppStore((s) => s.reopenGuide)

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="font-serif text-3xl font-medium text-text-primary">{t('settings.title')}</h1>

      <div className="rounded border border-border bg-bg-elevated p-5">
        <p className="mb-3 font-sans text-sm font-medium text-text-secondary">{t('settings.language')}</p>
        <LanguageToggle />
      </div>

      <div className="rounded border border-border bg-bg-elevated p-5">
        <Button variant="primary" onClick={reopenGuide}>
          {t('settings.guide')}
        </Button>
      </div>

      <div className="rounded border border-border bg-bg-elevated p-5">
        <h2 className="font-serif text-xl text-text-primary">{t('settings.about')}</h2>
        <p className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">{t('settings.aboutBody')}</p>
      </div>
    </section>
  )
}
