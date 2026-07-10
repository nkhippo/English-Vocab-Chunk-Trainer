import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckmarkResetButton } from '@/components/checkmark-reset'

export function TrainPage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-text-primary md:text-4xl">{t('train.title')}</h1>
        <p className="mt-3 max-w-2xl font-sans text-base leading-relaxed text-text-secondary md:text-lg">
          {t('train.subtitle')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/train/mode-a"
          className="rounded border border-border bg-bg-elevated p-5 transition hover:border-accent"
        >
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-text-muted">
            {t('train.modeALabel')}
          </span>
          <span className="mt-1 block font-serif text-xl text-text-primary">{t('modeA.title')}</span>
          <span className="mt-2 block font-sans text-sm text-text-secondary">{t('train.modeADesc')}</span>
        </Link>
        <Link
          to="/train/mode-b"
          className="rounded border border-border bg-bg-elevated p-5 transition hover:border-accent"
        >
          <span className="font-sans text-xs font-medium uppercase tracking-wide text-text-muted">
            {t('train.modeBLabel')}
          </span>
          <span className="mt-1 block font-serif text-xl text-text-primary">{t('modeB.title')}</span>
          <span className="mt-2 block font-sans text-sm text-text-secondary">{t('train.modeBDesc')}</span>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <CheckmarkResetButton mode="mode_a" />
        <CheckmarkResetButton mode="mode_b" />
      </div>

      <p className="font-sans text-sm text-text-muted">{t('train.modeCNote')}</p>
    </section>
  )
}
