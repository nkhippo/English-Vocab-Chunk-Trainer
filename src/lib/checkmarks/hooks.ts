import { useCallback, useEffect, useState } from 'react'
import { getCount, getModeEntries, setCount, STORAGE_KEY, subscribe } from './store'
import type { CheckmarkCount, CheckmarkMode } from './types'

function useCheckmarkSubscription(): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribe(() => setVersion((value) => value + 1))
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setVersion((value) => value + 1)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return version
}

export function useCheckmarkVersion(): number {
  return useCheckmarkSubscription()
}

export function useCheckmark(
  mode: CheckmarkMode,
  itemId: string,
): [CheckmarkCount, (count: CheckmarkCount) => void] {
  const version = useCheckmarkSubscription()
  const count = getCount(mode, itemId)
  void version

  const update = useCallback(
    (next: CheckmarkCount) => {
      setCount(mode, itemId, next)
    },
    [mode, itemId],
  )

  return [count, update]
}

export function useModeCheckmarks(mode: CheckmarkMode): Array<{ id: string; count: CheckmarkCount }> {
  const version = useCheckmarkSubscription()
  void version
  return getModeEntries(mode)
}
