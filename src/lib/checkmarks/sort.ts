import { getCount } from './store'
import type { LearningItem } from '@/types/learning'

export function sortByBrowseCheckmarks(items: LearningItem[]): LearningItem[] {
  return [...items].sort((a, b) => {
    const countA = getCount('browse', a.id)
    const countB = getCount('browse', b.id)
    if (countA !== countB) return countA - countB

    const freqA = a.frequency_rank_in_level ?? 999
    const freqB = b.frequency_rank_in_level ?? 999
    if (freqA !== freqB) return freqA - freqB

    return a.id.localeCompare(b.id)
  })
}
