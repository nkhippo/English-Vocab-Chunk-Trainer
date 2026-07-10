import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ok' | 'hold' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'border border-accent bg-accent text-bg-elevated hover:opacity-90 disabled:opacity-40',
  ok: 'border border-success bg-transparent text-success hover:bg-success/10 disabled:opacity-40',
  hold: 'border border-warning bg-transparent text-warning hover:bg-warning/10 disabled:opacity-40',
  ghost:
    'border border-border bg-transparent text-text-secondary hover:border-text-secondary hover:text-text-primary disabled:opacity-40',
}

export function Button({
  variant = 'ghost',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded px-5 py-2.5 font-sans text-sm font-medium tracking-wide transition ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
