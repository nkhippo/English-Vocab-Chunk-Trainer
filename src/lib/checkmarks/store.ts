import type { CheckmarkCount, CheckmarkMode, CheckmarkStore } from './types'

export const STORAGE_KEY = 'vct_checkmarks_v1'

type Listener = () => void
const listeners = new Set<Listener>()

let memoryStore: CheckmarkStore | null = null
let useMemoryOnly = false

function emptyStore(): CheckmarkStore {
  return { schema_version: 1, browse: {}, mode_a: {}, mode_b: {} }
}

function normalizeCount(value: unknown): CheckmarkCount {
  if (value === 1 || value === 2 || value === 3) return value
  return 0
}

function sanitizeStore(raw: unknown): CheckmarkStore {
  const base = emptyStore()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<CheckmarkStore>
  if (data.schema_version !== 1) return base

  for (const mode of ['browse', 'mode_a', 'mode_b'] as const) {
    const record = data[mode]
    if (!record || typeof record !== 'object') continue
    for (const [id, count] of Object.entries(record)) {
      const normalized = normalizeCount(count)
      if (normalized > 0) {
        base[mode][id] = normalized
      }
    }
  }

  return base
}

function readFromStorage(): CheckmarkStore {
  if (useMemoryOnly) {
    return memoryStore ?? emptyStore()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore()
    return sanitizeStore(JSON.parse(raw))
  } catch (error) {
    console.warn('[checkmarks] Failed to parse store; resetting.', error)
    return emptyStore()
  }
}

function writeToStorage(store: CheckmarkStore): void {
  if (useMemoryOnly) {
    memoryStore = store
    notify()
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    notify()
  } catch (error) {
    console.warn('[checkmarks] localStorage unavailable; using in-memory fallback.', error)
    useMemoryOnly = true
    memoryStore = store
    notify()
  }
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getStore(): CheckmarkStore {
  return readFromStorage()
}

export function getCount(mode: CheckmarkMode, itemId: string): CheckmarkCount {
  const store = readFromStorage()
  return store[mode][itemId] ?? 0
}

export function setCount(mode: CheckmarkMode, itemId: string, count: CheckmarkCount): void {
  const store = readFromStorage()
  if (count === 0) {
    delete store[mode][itemId]
  } else {
    store[mode][itemId] = count
  }
  writeToStorage(store)
}

export function resetMode(mode: CheckmarkMode): void {
  const store = readFromStorage()
  store[mode] = {}
  writeToStorage(store)
}

export function getModeEntries(mode: CheckmarkMode): Array<{ id: string; count: CheckmarkCount }> {
  const store = readFromStorage()
  return Object.entries(store[mode]).map(([id, count]) => ({ id, count }))
}
