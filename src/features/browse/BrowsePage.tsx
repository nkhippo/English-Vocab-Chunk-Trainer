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
          <h1 className="font-display text-3xl font-bold">{t('browse.title')}</h1>
          <p className="mt-2 text-lg text-ink-muted">{t('browse.subtitle')}</p>
        </div>
        <CheckmarkResetButton mode="browse" />
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-[12px] bg-paper-soft p-[5px]">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setActive(level)}
            className={`rounded-[9px] px-3.5 py-2 text-sm font-bold transition ${
              active === level
                ? 'bg-paper-elevated text-ink shadow-soft'
                : 'bg-transparent text-ink-muted'
            }`}
          >
            {level}
            <span className="ml-2 opacity-80">{counts[level] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[14px] border border-line bg-paper-elevated p-4 shadow-soft sm:p-6">
        {!ready ? (
          <p className="text-lg text-ink-muted">…</p>
        ) : total === 0 ? (
          <p className="text-lg text-ink-muted">{t('browse.empty')}</p>
        ) : items.length === 0 ? (
          <p className="text-lg text-ink-muted">{t('browse.emptyLevel', { level: active })}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-semibold">{t('browse.count', { count: items.length })}</p>
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-1 rounded-[13px] border-[1.5px] border-line bg-paper-soft transition hover:-translate-y-px hover:border-[#bfc3bc] hover:shadow-soft"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-semibold text-ink">{item.surface}</p>
                    </div>
                    <p className="shrink-0 text-base text-ink-muted">{item.translations_ja[0]}</p>
                    <span className="hidden rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong sm:inline">
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
      </div>

      <ItemDetailModal item={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </section>
  )
}
