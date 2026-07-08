import { useTranslation } from 'react-i18next'

export function TrainPage() {
  const { t } = useTranslation()

  return (
    <section className="rounded-3xl border border-dashed border-line bg-paper-elevated/70 p-8">
      <p className="text-sm font-medium text-brand">{t('common.phase2')}</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{t('train.title')}</h1>
      <p className="mt-4 max-w-xl text-ink-muted">{t('train.placeholder')}</p>
    </section>
  )
}
