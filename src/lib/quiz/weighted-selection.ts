import { getCount } from '@/lib/checkmarks'
import { CHECKMARK_WEIGHTS, type CheckmarkMode } from '@/lib/checkmarks/types'
import type { LearningItem } from '@/types/learning'
import { pickRandomItem } from './distractors'

type QuizMode = Extract<CheckmarkMode, 'mode_a' | 'mode_b'>

export function pickWeightedItem(items: LearningItem[], mode: QuizMode, excludeId?: string): LearningItem {
  const pool = excludeId ? items.filter((item) => item.id !== excludeId) : items
  if (pool.length === 0) {
    return pickRandomItem(items, excludeId)
  }

  const weighted = pool.map((item) => {
    const count = getCount(mode, item.id)
    return { item, weight: CHECKMARK_WEIGHTS[count] }
  })

  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  if (totalWeight <= 0) {
    return pool[Math.floor(Math.random() * pool.length)]
  }

  let remaining = Math.random() * totalWeight
  for (const entry of weighted) {
    remaining -= entry.weight
    if (remaining <= 0) return entry.item
  }

  return weighted[weighted.length - 1].item
}
