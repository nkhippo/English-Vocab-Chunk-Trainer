import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckmarkResetButton } from '@/components/checkmark-reset'

export function TrainPage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{t('train.title')}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">{t('train.subtitle')}</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Link
          to="/train/mode-a"
          className="flex items-start gap-3.5 rounded-[13px] border-[1.5px] border-line bg-paper-elevated p-4 transition hover:-translate-y-px hover:border-[#bfc3bc] hover:shadow-soft"
        >
          <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-ink text-sm font-extrabold text-white">
            A
          </span>
          <span className="min-w-0">
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wide text-brand">
              {t('train.modeALabel')}
            </span>
            <span className="mt-0.5 block text-[14.5px] font-bold text-ink">{t('modeA.title')}</span>
            <span className="mt-1 block text-[12.5px] text-ink-muted">{t('train.modeADesc')}</span>
          </span>
        </Link>
        <Link
          to="/train/mode-b"
          className="flex items-start gap-3.5 rounded-[13px] border-[1.5px] border-line bg-paper-elevated p-4 transition hover:-translate-y-px hover:border-[#bfc3bc] hover:shadow-soft"
        >
          <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-ink text-sm font-extrabold text-white">
            B
          </span>
          <span className="min-w-0">
            <span className="block text-[10.5px] font-extrabold uppercase tracking-wide text-brand">
              {t('train.modeBLabel')}
            </span>
            <span className="mt-0.5 block text-[14.5px] font-bold text-ink">{t('modeB.title')}</span>
            <span className="mt-1 block text-[12.5px] text-ink-muted">{t('train.modeBDesc')}</span>
          </span>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <CheckmarkResetButton mode="mode_a" />
        <CheckmarkResetButton mode="mode_b" />
      </div>

      <p className="text-sm text-ink-muted">{t('train.modeCNote')}</p>
    </section>
  )
}
