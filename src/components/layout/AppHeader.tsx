import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/lib/stores/app-store'

interface AppHeaderProps {
  /** When set, shows × close (train modes). Defaults to navigate home. */
  showClose?: boolean
  onClose?: () => void
}

export function AppHeader({ showClose = false, onClose }: AppHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setNavOpen = useAppStore((s) => s.setNavOpen)

  const handleClose = () => {
    if (onClose) onClose()
    else navigate('/')
  }

  return (
    <header className="flex h-11 shrink-0 items-center border-b border-border bg-bg-base px-4 md:h-16">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">
          <button
            type="button"
            aria-label={t('nav.menu')}
            className="grid size-10 place-items-center text-text-secondary hover:text-text-primary"
            onClick={() => setNavOpen(true)}
          >
            <span className="flex w-5 flex-col gap-1" aria-hidden="true">
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
              <span className="h-px w-full bg-current" />
            </span>
          </button>
        </div>
        <div className="justify-self-center">
          <span className="sr-only">Vocab & Chunk Trainer</span>
        </div>
        <div className="justify-self-end">
          {showClose ? (
            <button
              type="button"
              aria-label={t('nav.close')}
              className="grid size-10 place-items-center text-text-secondary hover:text-text-primary"
              onClick={handleClose}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                ×
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
