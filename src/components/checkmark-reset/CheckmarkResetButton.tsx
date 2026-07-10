import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
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
          'rounded border border-border px-3 py-2 font-sans text-sm font-medium text-text-secondary hover:border-accent hover:text-text-primary'
        }
        onClick={() => setConfirmOpen(true)}
      >
        {t('checkmarks.reset', { mode: modeLabel })}
      </button>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-text-primary/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-bg-elevated p-5"
          >
            <p className="font-serif text-lg text-text-primary">
              {t('checkmarks.resetConfirmTitle', { mode: modeLabel })}
            </p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">
              {t('checkmarks.resetConfirmBody')}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                {t('review.cancel')}
              </Button>
              <Button variant="hold" onClick={onConfirm} className="border-error text-error">
                {t('checkmarks.resetAction')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded bg-text-primary px-4 py-2 font-sans text-sm text-bg-elevated">
          {t('checkmarks.resetDone')}
        </div>
      ) : null}
    </>
  )
}
