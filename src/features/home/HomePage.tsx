import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-8">
      <div>
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
          {t('common.mvp')}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium text-text-primary md:text-5xl">
          {t('home.title')}
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-text-secondary md:text-lg">
          {t('home.body')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/train/mode-a"
          className="rounded border border-border bg-bg-elevated px-5 py-4 font-sans text-sm font-medium text-text-primary transition hover:border-accent"
        >
          {t('home.ctaModeA')}
        </Link>
        <Link
          to="/train/mode-b"
          className="rounded border border-border bg-bg-elevated px-5 py-4 font-sans text-sm font-medium text-text-primary transition hover:border-accent"
        >
          {t('home.ctaModeB')}
        </Link>
        <Link
          to="/browse"
          className="rounded border border-border bg-transparent px-5 py-4 font-sans text-sm font-medium text-text-secondary transition hover:border-accent hover:text-text-primary"
        >
          {t('home.ctaBrowse')}
        </Link>
        <Link
          to="/review"
          className="rounded border border-border bg-transparent px-5 py-4 font-sans text-sm font-medium text-text-secondary transition hover:border-accent hover:text-text-primary"
        >
          {t('home.ctaReview')}
        </Link>
      </div>
    </section>
  )
}
