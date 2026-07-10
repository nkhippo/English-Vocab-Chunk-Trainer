import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { guidePages } from '@/content/guide/pages'
import { Button } from '@/components/ui/Button'
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-lg border border-border bg-bg-elevated p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-sans text-sm text-text-muted">
            {t('guide.pageOf', { current: page + 1, total: guidePages.length })}
          </p>
          <button
            type="button"
            className="font-sans text-sm font-medium text-text-muted hover:text-text-primary"
            onClick={markGuideSeen}
          >
            {t('guide.skip')}
          </button>
        </div>
        <h2 className="font-serif text-2xl text-text-primary">{current.title[language]}</h2>
        <p className="mt-4 whitespace-pre-wrap font-sans leading-relaxed text-text-secondary">
          {current.body[language]}
        </p>
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            {t('guide.prev')}
          </Button>
          {isLast ? (
            <Button variant="primary" onClick={markGuideSeen}>
              {t('guide.done')}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setPage((p) => Math.min(guidePages.length - 1, p + 1))}>
              {t('guide.next')}
            </Button>
          )}
        </div>
        <button type="button" className="sr-only" onClick={() => setGuideOpen(false)}>
          {t('nav.close')}
        </button>
      </div>
    </div>
  )
}
