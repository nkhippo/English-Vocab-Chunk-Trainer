import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div className="rounded-[14px] border border-line bg-paper-elevated p-6 shadow-soft md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{t('common.mvp')}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">{t('home.title')}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">{t('home.body')}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/train/mode-a"
            className="rounded-[11px] bg-brand px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-brand-strong hover:shadow-soft"
          >
            {t('home.ctaModeA')}
          </Link>
          <Link
            to="/train/mode-b"
            className="rounded-[11px] bg-brand-soft px-5 py-3 text-sm font-bold text-brand-strong transition hover:-translate-y-px hover:shadow-soft"
          >
            {t('home.ctaModeB')}
          </Link>
          <Link
            to="/browse"
            className="rounded-[11px] border-[1.5px] border-line bg-transparent px-5 py-3 text-sm font-bold text-ink-muted transition hover:border-[#bfc3bc] hover:text-ink"
          >
            {t('home.ctaBrowse')}
          </Link>
          <Link
            to="/review"
            className="rounded-[11px] border-[1.5px] border-line bg-transparent px-5 py-3 text-sm font-bold text-ink-muted transition hover:border-[#bfc3bc] hover:text-ink"
          >
            {t('home.ctaReview')}
          </Link>
        </div>
      </div>
    </section>
  )
}
