import { useEffect, useRef, type RefObject } from 'react'

const SWIPE_MIN_DX = 72
const SWIPE_MAX_DY = 56

interface UseTrainInteractionsOptions {
  enabled: boolean
  canAdvance: boolean
  canReveal?: boolean
  onAdvance: () => void
  onReveal?: () => void
  swipeTargetRef?: RefObject<HTMLElement | null>
}

/** Space/Enter (+ optional reveal) and left-swipe → next for Mode A/B. */
export function useTrainInteractions({
  enabled,
  canAdvance,
  canReveal = false,
  onAdvance,
  onReveal,
  swipeTargetRef,
}: UseTrainInteractionsOptions) {
  const handlers = useRef({ onAdvance, onReveal, canAdvance, canReveal })
  handlers.current = { onAdvance, onReveal, canAdvance, canReveal }

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      const key = event.key
      const h = handlers.current

      if (key === ' ' || key === 'Enter') {
        event.preventDefault()
        if (h.canAdvance) {
          h.onAdvance()
        } else if (h.canReveal && h.onReveal) {
          h.onReveal()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const el = swipeTargetRef?.current
    if (!el) return

    let startX = 0
    let startY = 0
    let tracking = false

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      tracking = true
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking || event.changedTouches.length !== 1) return
      tracking = false
      const dx = event.changedTouches[0].clientX - startX
      const dy = event.changedTouches[0].clientY - startY
      if (Math.abs(dy) > SWIPE_MAX_DY) return
      if (dx <= -SWIPE_MIN_DX && handlers.current.canAdvance) {
        handlers.current.onAdvance()
      }
    }

    const onTouchCancel = () => {
      tracking = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [enabled, swipeTargetRef])
}
