import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckmarkResetButton } from '@/components/checkmark-reset'
import { CheckmarkRow } from '@/components/checkmark-row'
import { ItemDetailModal } from '@/components/item-detail-modal'
import { sortByBrowseCheckmarks, useCheckmark, useCheckmarkVersion } from '@/lib/checkmarks'
import { countByCefr, ensureDatasetLoaded, getItemsByCefr } from '@/lib/db'
import { labelCategory } from '@/lib/i18n/labels'
import type { CefrLevel, LearningItem } from '@/types/learning'

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

function BrowseCardCheckmarks({ itemId }: { itemId: string }) {
  const { t } = useTranslation()
  const [count, setCount] = useCheckmark('browse', itemId)

  return (
    <CheckmarkRow
      count={count}
      onChange={setCount}
      size="sm"
      ariaLabel={t('checkmarks.learningHistory')}
    />
  )
}

export function BrowsePage() {
  const { t } = useTranslation()
  const [active, setActive] = useState<CefrLevel>('A2')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [items, setItems] = useState<LearningItem[]>([])
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<LearningItem | null>(null)
  const checkmarkVersion = useCheckmarkVersion()

  useEffect(() => {
    void (async () => {
      await ensureDatasetLoaded()
      setCounts(await countByCefr())
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    if (!ready) return
    void (async () => {
      const raw = await getItemsByCefr(active)
      setItems(sortByBrowseCheckmarks(raw))
    })()
  }, [active, ready, checkmarkVersion])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-text-primary md:text-4xl">{t('browse.title')}</h1>
          <p className="mt-2 font-sans text-base text-text-secondary">{t('browse.subtitle')}</p>
        </div>
        <CheckmarkResetButton mode="browse" />
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded border border-border bg-bg-panel p-1">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setActive(level)}
            className={`rounded px-3.5 py-2 font-sans text-sm font-medium transition ${
              active === level
                ? 'bg-bg-elevated text-text-primary'
                : 'bg-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {level}
            <span className="ml-2 opacity-80">{counts[level] ?? 0}</span>
          </button>
        ))}
      </div>

      {!ready ? (
        <p className="font-sans text-text-muted">…</p>
      ) : total === 0 ? (
        <p className="font-sans text-text-muted">{t('browse.empty')}</p>
      ) : items.length === 0 ? (
        <p className="font-sans text-text-muted">{t('browse.emptyLevel', { level: active })}</p>
      ) : (
        <div className="space-y-3">
          <p className="font-sans text-sm font-medium text-text-secondary">
            {t('browse.count', { count: items.length })}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-1 rounded border border-border bg-bg-elevated transition hover:border-accent"
              >
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl text-text-primary">{item.surface}</p>
                    <p className="mt-1 truncate font-sans text-sm text-text-secondary">
                      {item.translations_ja[0]}
                    </p>
                  </div>
                  <span className="hidden shrink-0 font-sans text-xs text-text-muted sm:inline">
                    {labelCategory(t, item.category)}
                  </span>
                </button>
                <div className="shrink-0 pr-2">
                  <BrowseCardCheckmarks itemId={item.id} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ItemDetailModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </section>
  )
}
