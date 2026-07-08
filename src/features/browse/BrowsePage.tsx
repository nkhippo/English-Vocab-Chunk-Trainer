import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { countByCefr, ensureDatasetLoaded } from '@/lib/db'
import type { CefrLevel } from '@/types/learning'

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export function BrowsePage() {
  const { t } = useTranslation()
  const [active, setActive] = useState<CefrLevel>('A2')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      await ensureDatasetLoaded()
      setCounts(await countByCefr())
      setReady(true)
    })()
  }, [])

  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <section className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-bold">{t('browse.title')}</h1>
        <p className="mt-2 text-ink-muted">{t('browse.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setActive(level)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              active === level ? 'bg-brand text-white' : 'border border-line bg-paper-elevated text-ink-muted'
            }`}
          >
            {level}
            <span className="ml-2 opacity-80">{counts[level] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-paper-elevated p-6">
        {!ready ? (
          <p className="text-ink-muted">…</p>
        ) : total === 0 ? (
          <p className="text-ink-muted">{t('browse.empty')}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-semibold">
              {active}: {t('browse.count', { count: counts[active] ?? 0 })}
            </p>
            <input
              disabled
              placeholder={t('browse.searchHint')}
              className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-muted"
            />
          </div>
        )}
      </div>
    </section>
  )
}
