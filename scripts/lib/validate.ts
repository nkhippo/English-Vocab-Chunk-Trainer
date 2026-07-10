import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readJson } from './utils.ts'
import type { Dataset, LearningItem } from '../../src/types/learning.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const schemaPath = path.join(root, 'doc/spec/learning-data-schema.json')

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

function cefrLte(a: string, b: string) {
  return CEFR_ORDER.indexOf(a as (typeof CEFR_ORDER)[number]) <= CEFR_ORDER.indexOf(b as (typeof CEFR_ORDER)[number])
}

export interface ValidationReport {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export async function validateDataset(dataset: Dataset): Promise<ValidationReport> {
  const errors: string[] = []
  const warnings: string[] = []
  const schema = await readJson<object>(schemaPath)

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const valid = validate(dataset)
  if (!valid) {
    for (const err of validate.errors ?? []) {
      errors.push(`${err.instancePath || '/'} ${err.message ?? 'invalid'}`)
    }
  }

  const ids = new Set(dataset.items.map((i) => i.id))
  const insightIds = new Set((dataset.insights ?? []).map((i) => i.id))
  const surfaces = new Map<string, string>()

  for (const item of dataset.items) {
    checkItemRefs(item, ids, insightIds, errors, warnings)
    checkCefrCeiling(item, errors)
    checkRegisterCoverage(item, warnings)
    checkContexts(item, errors)

    const key = `${item.surface.toLowerCase()}::${item.category}`
    if (surfaces.has(key)) {
      warnings.push(`possible duplicate surface+category: ${item.surface} (${item.category})`)
    } else {
      surfaces.set(key, item.id)
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

function checkItemRefs(
  item: LearningItem,
  ids: Set<string>,
  insightIds: Set<string>,
  errors: string[],
  warnings: string[],
) {
  if (item.insight_id && !insightIds.has(item.insight_id)) {
    errors.push(`${item.id}: insight_id ${item.insight_id} not found`)
  }

  for (const syn of item.synonyms ?? []) {
    if (ids.has(syn.item)) continue
    if (!/^[a-z0-9_]+$/.test(syn.item)) continue
    warnings.push(`${item.id}: synonym ${syn.item} is not an existing id (plain text OK)`)
  }
}

function checkCefrCeiling(item: LearningItem, errors: string[]) {
  for (const ex of item.example_sentences ?? []) {
    if (!cefrLte(ex.surrounding_cefr_ceiling, item.cefr_level)) {
      // Spec: surrounding vocabulary must not exceed item level.
      // Ceiling should be <= item.cefr_level.
      errors.push(
        `${item.id}: example ceiling ${ex.surrounding_cefr_ceiling} exceeds item level ${item.cefr_level}`,
      )
    }
  }
}

function checkRegisterCoverage(item: LearningItem, warnings: string[]) {
  const exampleRegisters = new Set((item.example_sentences ?? []).map((e) => e.register))
  const itemRegisters = new Set(
    Array.isArray(item.register) ? item.register : [item.register].filter(Boolean),
  )

  for (const r of exampleRegisters) {
    if (!itemRegisters.has(r)) {
      warnings.push(`${item.id}: example has register "${r}" but item.register does not include it`)
    }
  }
  for (const r of itemRegisters) {
    if (!exampleRegisters.has(r)) {
      warnings.push(`${item.id}: item.register includes "${r}" but no example has that register`)
    }
  }

  if (exampleRegisters.size === 0) {
    warnings.push(`${item.id}: no examples`)
    return
  }

  if (item.category === 'collocation' || item.category === 'phrasal_verb') {
    if (exampleRegisters.size < 3) {
      warnings.push(
        `${item.id}: expected 3 registers (formal/neutral/informal) for ${item.category}, got ${exampleRegisters.size} (${[...exampleRegisters].join(', ')})`,
      )
    }
  }

  if (item.category === 'institutionalized') {
    if (exampleRegisters.size < 1) {
      warnings.push(`${item.id}: institutionalized item has no examples`)
    }
  }
}

function normalizeSurfaceToken(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, '').trim()
}

function checkContexts(item: LearningItem, errors: string[]) {
  const contexts = item.contexts
  if (!contexts) {
    errors.push(`${item.id}: contexts[] is required (exactly 5 passages)`)
    return
  }
  if (contexts.length !== 5) {
    errors.push(`${item.id}: contexts must have exactly 5 items, got ${contexts.length}`)
  }

  const surfaceNorm = normalizeSurfaceToken(item.surface)

  for (const ctx of contexts) {
    const { text_en, target_span, cloze_spans } = ctx
    if (target_span.start < 0 || target_span.end > text_en.length || target_span.start >= target_span.end) {
      errors.push(`${item.id}/${ctx.id}: target_span out of range`)
      continue
    }

    const targetText = text_en.slice(target_span.start, target_span.end)
    const targetNorm = normalizeSurfaceToken(targetText)
    if (!targetNorm.includes(surfaceNorm.split(/\s+/)[0] ?? '') && !surfaceNorm.includes(targetNorm.split(/\s+/)[0] ?? '')) {
      // Allow conjugations: require at least one content word overlap with surface
      const surfaceWords = surfaceNorm.split(/\s+/).filter(Boolean)
      const targetWords = targetNorm.split(/\s+/).filter(Boolean)
      const overlap = surfaceWords.some((w) => targetWords.some((tw) => tw.startsWith(w.slice(0, 3)) || w.startsWith(tw.slice(0, 3))))
      if (!overlap) {
        errors.push(`${item.id}/${ctx.id}: target_span "${targetText}" does not match surface "${item.surface}"`)
      }
    }

    for (const span of cloze_spans) {
      if (span.start < 0 || span.end > text_en.length || span.start >= span.end) {
        errors.push(`${item.id}/${ctx.id}: cloze_span out of range`)
        continue
      }
      const sliced = text_en.slice(span.start, span.end)
      if (sliced !== span.answer) {
        errors.push(`${item.id}/${ctx.id}: cloze answer "${span.answer}" != slice "${sliced}"`)
      }
    }
  }
}
