import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-line bg-paper-elevated/90 p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Phase 1</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">{t('home.title')}</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{t('home.body')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/train"
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-paper"
          >
            {t('home.ctaTrain')}
          </Link>
          <Link
            to="/browse"
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            {t('home.ctaBrowse')}
          </Link>
          <Link
            to="/review"
            className="rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand-strong hover:bg-teal-100"
          >
            {t('home.ctaReview')}
          </Link>
        </div>
      </div>
    </section>
  )
}
