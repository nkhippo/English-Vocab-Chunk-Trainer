import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function TrainPage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{t('train.title')}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted">{t('train.subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/train/mode-a"
          className="rounded-3xl border border-line bg-paper-elevated p-6 transition hover:border-brand hover:shadow-sm"
        >
          <p className="text-sm font-medium text-brand">{t('train.modeALabel')}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t('modeA.title')}</h2>
          <p className="mt-3 text-base text-ink-muted">{t('train.modeADesc')}</p>
        </Link>
        <Link
          to="/train/mode-b"
          className="rounded-3xl border border-line bg-paper-elevated p-6 transition hover:border-brand hover:shadow-sm"
        >
          <p className="text-sm font-medium text-brand">{t('train.modeBLabel')}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t('modeB.title')}</h2>
          <p className="mt-3 text-base text-ink-muted">{t('train.modeBDesc')}</p>
        </Link>
      </div>

      <p className="text-sm text-ink-muted">{t('train.modeCNote')}</p>
    </section>
  )
}
