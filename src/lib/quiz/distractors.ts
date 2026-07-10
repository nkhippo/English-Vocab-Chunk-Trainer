import type { ConfusableEntry, LearningItem } from '@/types/learning'

export type DistractorMode = 'random' | 'confusables'

function normalizeSurface(value: string): string {
  return value.toLowerCase().replace(/\?/g, '').trim()
}

export function pickRandomItem(items: LearningItem[], excludeId?: string): LearningItem {
  const pool = excludeId ? items.filter((item) => item.id !== excludeId) : items
  if (pool.length === 0) return items[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getConfusableDistractorLabel(conf: ConfusableEntry, allItems: LearningItem[]): string {
  const normalized = normalizeSurface(conf.item)
  const match = allItems.find(
    (item) =>
      normalizeSurface(item.surface) === normalized ||
      item.id === conf.item.replace(/\s+/g, '_').replace(/[^\w]/g, ''),
  )
  if (match?.translations_ja[0]) return match.translations_ja[0]
  if (conf.correct_usage_ja) {
    const snippet = conf.correct_usage_ja.split(/[。.!?]/)[0]?.trim()
    if (snippet) return snippet
  }
  return conf.item
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildModeAChoices(
  target: LearningItem,
  allItems: LearningItem[],
  mode: DistractorMode,
): { choices: string[]; correctIndex: number } {
  const correct = target.translations_ja[0] ?? ''
  const distractors: string[] = []

  if (mode === 'confusables') {
    for (const conf of target.confusables ?? []) {
      if (distractors.length >= 3) break
      const label = getConfusableDistractorLabel(conf, allItems)
      if (label && label !== correct && !distractors.includes(label)) {
        distractors.push(label)
      }
    }
  }

  const others = allItems.filter((item) => item.id !== target.id)
  let guard = 0
  while (distractors.length < 3 && guard < 50) {
    guard += 1
    const random = others[Math.floor(Math.random() * others.length)]
    const label = random?.translations_ja[0]
    if (label && label !== correct && !distractors.includes(label)) {
      distractors.push(label)
    }
  }

  const choices = shuffle([correct, ...distractors.slice(0, 3)])
  return { choices, correctIndex: choices.indexOf(correct) }
}
