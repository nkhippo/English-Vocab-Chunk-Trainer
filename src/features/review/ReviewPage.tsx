import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CEFR_HOTKEYS, useAppStore } from '@/lib/stores/app-store'
import type { CefrLevel, ReviewStateItem, SeedItem } from '@/types/learning'
import sampleSeeds from '@/data/sample-seeds.json'
import { labelCategory, labelFrequencyHint, labelRegister } from '@/lib/i18n/labels'

function normalizeItems(raw: unknown, sourceFile: string) {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: SeedItem[] }).items
      : null

  if (!list) throw new Error('JSON must be an array or { items: [] }')

  const items: ReviewStateItem[] = list.map((item) => ({
    ...(item as SeedItem),
    decision: 'pending',
  }))

  return {
    sourceFile,
    updatedAt: new Date().toISOString(),
    items,
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ReviewPage() {
  const { t } = useTranslation()
  const session = useAppStore((s) => s.reviewSession)
  const index = useAppStore((s) => s.reviewIndex)
  const setReviewSession = useAppStore((s) => s.setReviewSession)
  const setReviewIndex = useAppStore((s) => s.setReviewIndex)
  const updateReviewItem = useAppStore((s) => s.updateReviewItem)

  const [editOpen, setEditOpen] = useState(false)
  const [editText, setEditText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const item = session?.items[index]
  const total = session?.items.length ?? 0
  const decided = useMemo(
    () => session?.items.filter((i) => i.decision !== 'pending').length ?? 0,
    [session],
  )
  const accepted = session?.items.filter((i) => i.decision === 'accepted').length ?? 0
  const rejected = session?.items.filter((i) => i.decision === 'rejected').length ?? 0
  const complete = total > 0 && decided === total

  const move = useCallback(
    (delta: number) => {
      if (!session) return
      setReviewIndex(Math.min(total - 1, Math.max(0, index + delta)))
    },
    [index, session, setReviewIndex, total],
  )

  const decide = useCallback(
    (decision: 'accepted' | 'rejected') => {
      if (!session || !item) return
      updateReviewItem(index, { decision })
      if (index < total - 1) setReviewIndex(index + 1)
    },
    [index, item, session, setReviewIndex, total, updateReviewItem],
  )

  const setCefr = useCallback(
    (level: CefrLevel) => {
      if (!item) return
      updateReviewItem(index, { cefr_override: level, cefr_level: level })
    },
    [index, item, updateReviewItem],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (editOpen) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const key = event.key.toLowerCase()
      if (key === 'y') decide('accepted')
      if (key === 'n') decide('rejected')
      if (key === 'e' && item) {
        setEditText((item.translations_override ?? item.translations_ja).join('\n'))
        setEditOpen(true)
      }
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
      if (CEFR_HOTKEYS[event.key]) setCefr(CEFR_HOTKEYS[event.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [decide, editOpen, item, move, setCefr])

  const onFile = async (file: File) => {
    try {
      setError(null)
      const text = await file.text()
      const json = JSON.parse(text) as unknown
      setReviewSession(normalizeItems(json, file.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load JSON')
    }
  }

  const exportValidated = () => {
    if (!session) return
    const acceptedItems = session.items
      .filter((i) => i.decision === 'accepted')
      .map(({ decision: _d, translations_override, cefr_override, ...rest }) => ({
        ...rest,
        translations_ja: translations_override ?? rest.translations_ja,
        cefr_level: cefr_override ?? rest.cefr_level,
        meta: { validated_by_user: true },
      }))
    const base = session.sourceFile.replace(/\.json$/i, '')
    downloadJson(`${base}_validated.json`, acceptedItems)
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">{t('review.title')}</h1>
        <p className="mt-2 text-ink-muted">{t('review.subtitle')}</p>
      </div>

      {!session ? (
        <div className="rounded-3xl border border-line bg-paper-elevated p-6 space-y-4">
          <p className="text-ink-muted">{t('review.loadHint')}</p>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-strong">
              {t('review.loadFile')}
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void onFile(file)
                }}
              />
            </label>
            <button
              type="button"
              className="rounded-xl border border-line px-4 py-2.5 text-sm"
              onClick={() => setReviewSession(normalizeItems(sampleSeeds, 'sample-seeds.json'))}
            >
              {t('review.loadSample')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper-elevated px-4 py-3">
            <p className="text-sm font-medium">
              {t('review.progress', {
                current: Math.min(index + 1, total),
                total,
                percent: total ? Math.round((decided / total) * 100) : 0,
              })}
            </p>
            <p className="text-xs text-ink-muted">
              {t('review.accepted')}: {accepted} / {t('review.rejected')}: {rejected}
            </p>
          </div>

          {complete ? (
            <div className="rounded-3xl border border-success/30 bg-green-50 p-6">
              <h2 className="font-display text-2xl font-bold text-success">{t('review.completeTitle')}</h2>
              <p className="mt-2 text-ink-muted">
                {t('review.completeBody', { accepted, rejected, total })}
              </p>
            </div>
          ) : null}

          {item ? (
            <article className="rounded-3xl border border-line bg-paper-elevated p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-ink-muted">
                    {labelCategory(t, item.category)}
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold">{item.surface}</h2>
                  <p className="mt-1 font-mono text-sm text-brand">@{item.id}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.decision === 'accepted'
                      ? 'bg-green-100 text-success'
                      : item.decision === 'rejected'
                        ? 'bg-red-100 text-danger'
                        : 'bg-slate-100 text-ink-muted'
                  }`}
                >
                  {t(`review.${item.decision}`)}
                </span>
              </div>

              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink-muted">{t('review.fields.cefr')}</dt>
                  <dd className="font-semibold">{item.cefr_override ?? item.cefr_level}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('review.fields.register')}</dt>
                  <dd className="font-semibold">{labelRegister(t, item.register)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('review.fields.collocationPattern')}</dt>
                  <dd className="font-semibold">{String(item.collocation_pattern ?? '—')}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">{t('review.fields.frequencyHint')}</dt>
                  <dd className="font-semibold">{labelFrequencyHint(t, item.frequency_hint)}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <p className="text-xs text-ink-muted">{t('review.fields.translationsJa')}</p>
                <ul className="mt-1 list-disc pl-5 text-ink">
                  {(item.translations_override ?? item.translations_ja).map((tr) => (
                    <li key={tr}>{tr}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-success px-4 py-2 text-sm font-medium text-white"
                  onClick={() => decide('accepted')}
                >
                  Y · {t('review.accepted')}
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-danger px-4 py-2 text-sm font-medium text-white"
                  onClick={() => decide('rejected')}
                >
                  N · {t('review.rejected')}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-line px-4 py-2 text-sm"
                  onClick={() => {
                    setEditText((item.translations_override ?? item.translations_ja).join('\n'))
                    setEditOpen(true)
                  }}
                >
                  E · {t('review.editTranslations')}
                </button>
                <button type="button" className="rounded-xl border border-line px-4 py-2 text-sm" onClick={() => move(-1)}>
                  ←
                </button>
                <button type="button" className="rounded-xl border border-line px-4 py-2 text-sm" onClick={() => move(1)}>
                  →
                </button>
              </div>
              <p className="mt-4 text-xs text-ink-muted">{t('review.shortcuts')}</p>
            </article>
          ) : (
            <p>{t('review.noItems')}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white"
              onClick={exportValidated}
            >
              {t('review.export')}
            </button>
            <button
              type="button"
              className="rounded-xl border border-line px-4 py-2.5 text-sm"
              onClick={() => setReviewSession(null)}
            >
              {t('review.loadFile')}
            </button>
          </div>
          <p className="text-xs text-ink-muted">{t('review.saveNote')}</p>
        </>
      )}

      {editOpen && item ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-paper-elevated p-6 shadow-xl">
            <h3 className="font-semibold">{t('review.editTranslations')}</h3>
            <textarea
              className="mt-3 h-40 w-full rounded-xl border border-line p-3 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-xl border border-line px-3 py-2 text-sm" onClick={() => setEditOpen(false)}>
                {t('review.cancel')}
              </button>
              <button
                type="button"
                className="rounded-xl bg-brand px-3 py-2 text-sm text-white"
                onClick={() => {
                  const translations = editText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  updateReviewItem(index, {
                    translations_override: translations,
                    translations_ja: translations,
                  })
                  setEditOpen(false)
                }}
              >
                {t('review.save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
