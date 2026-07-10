import { useCallback, useEffect, useState } from 'react'

/** Display-only session timer (seconds). Does not persist. */
export function useSessionTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!active) return
    setSeconds(0)
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [active])

  const reset = useCallback(() => setSeconds(0), [])

  return { seconds, label: `${seconds}s`, reset }
}
