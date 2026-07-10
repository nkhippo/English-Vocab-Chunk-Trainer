import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidthClassName?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = 'max-w-2xl',
}: ModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-primary/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label={t('nav.close')} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 max-h-[92vh] w-full overflow-auto rounded-t-lg border border-border bg-bg-elevated p-5 shadow-lg sm:rounded-lg sm:p-6 ${maxWidthClassName}`}
      >
        {(title || true) && (
          <div className="mb-5 flex items-start justify-between gap-3">
            {title ? <p className="font-sans text-sm font-medium text-text-secondary">{title}</p> : <span />}
            <button
              type="button"
              className="rounded border border-border px-3 py-1 text-lg leading-none text-text-muted hover:text-text-primary"
              onClick={onClose}
              aria-label={t('nav.close')}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
