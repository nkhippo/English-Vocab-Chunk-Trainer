import { useState, type ReactNode } from 'react'

interface AccordionSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

/** Strong section heading (Crimson) with light body area. */
export function AccordionSection({ title, defaultOpen = true, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 py-1 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="font-serif text-lg font-medium text-text-primary md:text-xl">{title}</span>
        <span className="font-sans text-sm text-text-muted">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="space-y-4">{children}</div> : null}
    </div>
  )
}
