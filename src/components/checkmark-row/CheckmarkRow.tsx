import { useCallback, type KeyboardEvent } from 'react'
import type { CheckmarkCount } from '@/lib/checkmarks'

interface CheckmarkRowProps {
  count: CheckmarkCount
  onChange: (count: CheckmarkCount) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  ariaLabel?: string
}

const SIZE_CLASS = {
  sm: 'h-4 w-4 text-sm',
  md: 'h-5 w-5 text-base',
  lg: 'h-6 w-6 text-lg',
} as const

export function CheckmarkRow({
  count,
  onChange,
  size = 'md',
  disabled = false,
  ariaLabel,
}: CheckmarkRowProps) {
  const boxClass = SIZE_CLASS[size]

  const handleSlot = useCallback(
    (slot: 1 | 2 | 3) => {
      if (disabled) return
      if (count < slot) {
        onChange(slot)
      } else {
        onChange((slot - 1) as CheckmarkCount)
      }
    },
    [count, disabled, onChange],
  )

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return
    if (event.key >= '0' && event.key <= '3') {
      event.preventDefault()
      onChange(Number(event.key) as CheckmarkCount)
    }
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      className="inline-flex items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      {([1, 2, 3] as const).map((slot) => {
        const filled = count >= slot
        return (
          <button
            key={slot}
            type="button"
            disabled={disabled}
            aria-pressed={filled}
            aria-label={`${slot}`}
            onClick={(event) => {
              event.stopPropagation()
              handleSlot(slot)
            }}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 disabled:opacity-50 ${boxClass}`}
          >
            <span
              className={`flex ${boxClass} items-center justify-center rounded border font-semibold leading-none ${
                filled
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-400 bg-paper text-gray-400'
              }`}
            >
              {filled ? '☑' : '▢'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
