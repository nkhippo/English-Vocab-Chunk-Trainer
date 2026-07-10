const STORAGE_KEY = 'vct_passage_history_v1'

export type TrainModeKey = 'mode_a' | 'mode_b'

type PassageHistory = Record<string, Partial<Record<TrainModeKey, number[]>>>

function readHistory(): PassageHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PassageHistory
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeHistory(history: PassageHistory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/** Passage indices are 1-based (1..5). */
export function getSeenPassageIndices(itemId: string, mode: TrainModeKey): number[] {
  return readHistory()[itemId]?.[mode] ?? []
}

export function recordPassageSeen(itemId: string, mode: TrainModeKey, passageIndex1Based: number) {
  const history = readHistory()
  const item = history[itemId] ?? {}
  const prev = item[mode] ?? []
  if (!prev.includes(passageIndex1Based)) {
    item[mode] = [...prev, passageIndex1Based]
  } else {
    item[mode] = prev
  }
  history[itemId] = item
  writeHistory(history)
}

export function pickPassageIndex(itemId: string, mode: TrainModeKey, passageCount = 5): number {
  const seen = new Set(getSeenPassageIndices(itemId, mode))
  const unseen = Array.from({ length: passageCount }, (_, i) => i + 1).filter((n) => !seen.has(n))
  const pool = unseen.length > 0 ? unseen : Array.from({ length: passageCount }, (_, i) => i + 1)
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function pickRandomItemId(itemIds: string[], excludeId?: string | null): string | null {
  const pool = excludeId ? itemIds.filter((id) => id !== excludeId) : itemIds
  const use = pool.length > 0 ? pool : itemIds
  if (use.length === 0) return null
  return use[Math.floor(Math.random() * use.length)]!
}
