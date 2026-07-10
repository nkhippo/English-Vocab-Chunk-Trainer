import type { ClozeSpan, ItemContext, LearningItem, TextSpan } from '@/types/learning'

export function getNeutralExample(item: LearningItem) {
  return (
    item.example_sentences.find((ex) => ex.register === 'neutral') ?? item.example_sentences[0] ?? null
  )
}

export function renderHighlightedPassage(text: string, span: TextSpan) {
  const before = text.slice(0, span.start)
  const target = text.slice(span.start, span.end)
  const after = text.slice(span.end)
  return { before, target, after }
}

/** Short answers (1–4 chars) → 4 underscores; longer → 6. */
export function clozeUnderlineForAnswer(answer: string): string {
  return answer.length <= 4 ? '____' : '______'
}

export function generateClozeSegments(textEn: string, clozeSpans: ClozeSpan[]) {
  const sorted = [...clozeSpans].sort((a, b) => a.start - b.start)
  const segments: Array<{ type: 'text' | 'blank'; value: string }> = []
  let cursor = 0

  for (const span of sorted) {
    if (span.start > cursor) {
      segments.push({ type: 'text', value: textEn.slice(cursor, span.start) })
    }
    const answerLen = span.end - span.start
    const underline = answerLen <= 4 ? '____' : '______'
    segments.push({ type: 'blank', value: underline })
    cursor = span.end
  }

  if (cursor < textEn.length) {
    segments.push({ type: 'text', value: textEn.slice(cursor) })
  }

  return segments
}

export function formatEncounterLabel(cefr: string, encounters: number, language: 'ja' | 'en') {
  if (language === 'ja') return `${cefr} · 出会い ${encounters} 回`
  return `${cefr} · ${encounters} encounters`
}

export function getContextOrNull(item: LearningItem, index1Based: number): ItemContext | null {
  const contexts = item.contexts
  if (!contexts || contexts.length === 0) return null
  return contexts[index1Based - 1] ?? null
}

/** Mode A/B: only items with exactly 5 contexts are eligible. */
export function filterEligibleTrainItems(items: LearningItem[]): LearningItem[] {
  return items.filter((item) => item.contexts?.length === 5)
}
