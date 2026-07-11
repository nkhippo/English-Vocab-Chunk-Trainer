import { Button } from '@/components/ui/Button'

interface AppFooterProps {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  className?: string
}

/** Sticky primary CTA only (pause removed in v8). */
export function AppFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  className = '',
}: AppFooterProps) {
  return (
    <footer
      className={`flex shrink-0 items-center border-t border-border bg-bg-base px-4 py-3 ${className}`}
    >
      <div className="mx-auto w-full max-w-xl">
        <Button
          variant="primary"
          className="min-h-14 w-full rounded-xl px-8 py-4 text-base"
          onClick={onPrimary}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </Button>
      </div>
    </footer>
  )
}
