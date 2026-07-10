import { Button } from '@/components/ui/Button'

interface AppFooterProps {
  onPause: () => void
  pauseLabel: string
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  primaryVariant?: 'primary' | 'ghost'
}

export function AppFooter({
  onPause,
  pauseLabel,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryVariant = 'primary',
}: AppFooterProps) {
  return (
    <footer className="flex h-20 shrink-0 items-center border-t border-border bg-bg-base px-4">
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
        <div />
        <div className="justify-self-center">
          <Button variant="ghost" onClick={onPause}>
            {pauseLabel}
          </Button>
        </div>
        <div className="justify-self-end">
          <Button variant={primaryVariant} onClick={onPrimary} disabled={primaryDisabled}>
            {primaryLabel}
          </Button>
        </div>
      </div>
    </footer>
  )
}
