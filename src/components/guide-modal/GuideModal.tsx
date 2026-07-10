import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { guidePages } from '@/content/guide/pages'
import { useAppStore } from '@/lib/stores/app-store'

export function GuideModal() {
  const { t } = useTranslation()
  const open = useAppStore((s) => s.guideOpen)
  const language = useAppStore((s) => s.language)
  const setGuideOpen = useAppStore((s) => s.setGuideOpen)
  const markGuideSeen = useAppStore((s) => s.markGuideSeen)
  const [page, setPage] = useState(0)

  if (!open) return null

  const current = guidePages[page]
  const isLast = page === guidePages.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-[14px] border border-line bg-paper-elevated p-6 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-ink-muted">
            {t('guide.pageOf', { current: page + 1, total: guidePages.length })}
          </p>
          <button type="button" className="text-sm font-bold text-ink-muted hover:text-ink" onClick={markGuideSeen}>
            {t('guide.skip')}
          </button>
        </div>
        <h2 className="font-display text-2xl font-bold text-brand-strong">{current.title[language]}</h2>
        <p className="mt-4 leading-relaxed text-ink-muted whitespace-pre-wrap">{current.body[language]}</p>
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-[11px] border-[1.5px] border-line px-4 py-2 text-sm font-bold text-ink-muted disabled:opacity-40 hover:border-[#bfc3bc] hover:text-ink"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            {t('guide.prev')}
          </button>
          {isLast ? (
            <button
              type="button"
              className="rounded-[11px] bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-brand-strong hover:shadow-soft"
              onClick={markGuideSeen}
            >
              {t('guide.done')}
            </button>
          ) : (
            <button
              type="button"
              className="rounded-[11px] bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-brand-strong hover:shadow-soft"
              onClick={() => setPage((p) => Math.min(guidePages.length - 1, p + 1))}
            >
              {t('guide.next')}
            </button>
          )}
        </div>
        <button type="button" className="sr-only" onClick={() => setGuideOpen(false)}>
          {t('nav.close')}
        </button>
      </div>
    </div>
  )
}
