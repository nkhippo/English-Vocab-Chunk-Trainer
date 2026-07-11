/**
 * Verify contexts[].target_span / cloze_spans indices against text_en.
 *
 * Usage:
 *   pnpm run verify:contexts -- data/staging/A2_collocation_batch3.json
 *   pnpm run verify:contexts -- data/current/items.json
 *
 * Accepts either a LearningItem[] array or a Dataset { items: [...] }.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface TextSpan {
  start: number
  end: number
}

interface ClozeSpan extends TextSpan {
  answer: string
}

interface ItemContext {
  id: string
  text_en: string
  target_span: TextSpan
  cloze_spans: ClozeSpan[]
}

interface LearningItemLike {
  id: string
  surface?: string
  contexts?: ItemContext[]
}

function loadItems(path: string): LearningItemLike[] {
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as
    | LearningItemLike[]
    | { items: LearningItemLike[] }
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw.items)) return raw.items
  throw new Error(`Unrecognized JSON shape in ${path} (expected array or { items })`)
}

function slice(text: string, span: TextSpan): string {
  return text.slice(span.start, span.end)
}

function main() {
  const inputArg = process.argv.slice(2).find((arg) => arg !== '--')
  if (!inputArg) {
    console.error('Usage: pnpm run verify:contexts -- <path-to-json>')
    process.exit(1)
  }

  const path = resolve(inputArg)
  const items = loadItems(path)
  let errors = 0
  let checked = 0

  for (const item of items) {
    const contexts = item.contexts ?? []
    for (const ctx of contexts) {
      checked += 1
      const target = slice(ctx.text_en, ctx.target_span)
      if (!target) {
        console.error(`✗ [${item.id}/${ctx.id}] target_span empty or out of range`)
        errors += 1
      }

      for (const cs of ctx.cloze_spans ?? []) {
        const actual = slice(ctx.text_en, cs)
        if (actual !== cs.answer) {
          console.error(
            `✗ [${item.id}/${ctx.id}] cloze expected '${cs.answer}' got '${actual}' (span ${cs.start}:${cs.end})`,
          )
          errors += 1
        }
      }

      if ((ctx.cloze_spans?.length ?? 0) === 0) {
        console.error(`✗ [${item.id}/${ctx.id}] cloze_spans missing`)
        errors += 1
      }
    }

    if (contexts.length > 0 && contexts.length !== 5) {
      console.error(`✗ [${item.id}] contexts length ${contexts.length} (expected 5 when present)`)
      errors += 1
    }
  }

  if (errors === 0) {
    console.log(`✓ contexts OK (${items.length} items, ${checked} passages) — ${path}`)
    process.exit(0)
  }

  console.error(`✗ ${errors} context index error(s) in ${path}`)
  process.exit(1)
}

main()
