import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resetMode, type CheckmarkMode } from '@/lib/checkmarks'

interface CheckmarkResetButtonProps {
  mode: CheckmarkMode
  className?: string
}

export function CheckmarkResetButton({ mode, className }: CheckmarkResetButtonProps) {
  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState(false)

  const modeLabel = t(`checkmarks.mode.${mode}`)

  const onConfirm = () => {
    resetMode(mode)
    setConfirmOpen(false)
    setToast(true)
    window.setTimeout(() => setToast(false), 2500)
  }

  return (
    <>
      <button
        type="button"
        className={
          className ??
          'rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-muted hover:bg-paper hover:text-ink'
        }
        onClick={() => setConfirmOpen(true)}
      >
        {t('checkmarks.reset', { mode: modeLabel })}
      </button>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-5 shadow-xl"
          >
            <p className="text-base font-semibold text-ink">{t('checkmarks.resetConfirmTitle', { mode: modeLabel })}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t('checkmarks.resetConfirmBody')}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium"
                onClick={() => setConfirmOpen(false)}
              >
                {t('review.cancel')}
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={onConfirm}
              >
                {t('checkmarks.resetAction')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg">
          {t('checkmarks.resetDone')}
        </div>
      ) : null}
    </>
  )
}
