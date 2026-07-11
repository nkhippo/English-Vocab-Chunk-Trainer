import { useEffect, useRef, type RefObject } from 'react'

const SWIPE_MIN_DX = 72
const SWIPE_MAX_DY = 56

interface UseTrainInteractionsOptions {
  enabled: boolean
  /** When false, swipe / Space / Enter are ignored (e.g. no OK/Hold yet). */
  canAdvance: boolean
  /** Mode B: Space/Enter may reveal before choice is set. */
  canReveal?: boolean
  onOk: () => void
  onHold: () => void
  onAdvance: () => void
  onReveal?: () => void
  /** Attach swipe listeners to this element (mobile). */
  swipeTargetRef?: RefObject<HTMLElement | null>
}

/** Keyboard (O/H/Space/Enter) + left-swipe → next for Mode A/B. */
export function useTrainInteractions({
  enabled,
  canAdvance,
  canReveal = false,
  onOk,
  onHold,
  onAdvance,
  onReveal,
  swipeTargetRef,
}: UseTrainInteractionsOptions) {
  const handlers = useRef({ onOk, onHold, onAdvance, onReveal, canAdvance, canReveal })
  handlers.current = { onOk, onHold, onAdvance, onReveal, canAdvance, canReveal }

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

      const key = event.key
      const lower = key.length === 1 ? key.toLowerCase() : key
      const h = handlers.current

      if (lower === 'o') {
        event.preventDefault()
        h.onOk()
        return
      }
      if (lower === 'h') {
        event.preventDefault()
        h.onHold()
        return
      }
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
      // Left swipe
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
