import { useAppStore } from '@/lib/stores/app-store'

interface AppHeaderProps {
  cefrLabel?: string | null
  timerLabel?: string | null
}

export function AppHeader({ cefrLabel = null, timerLabel = null }: AppHeaderProps) {
  const setNavOpen = useAppStore((s) => s.setNavOpen)

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-bg-base px-4">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">
          <button
            type="button"
            aria-label="Menu"
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
          {cefrLabel ? (
            <p className="font-sans text-sm text-text-muted">{cefrLabel}</p>
          ) : (
            <span className="sr-only">Vocab & Chunk Trainer</span>
          )}
        </div>
        <div className="justify-self-end">
          {timerLabel ? <p className="font-sans text-sm text-text-muted tabular-nums">{timerLabel}</p> : null}
        </div>
      </div>
    </header>
  )
}
