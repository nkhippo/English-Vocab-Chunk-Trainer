import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readJson } from './utils.ts'
import type { Dataset, LearningItem } from '../../src/types/learning.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const schemaPath = path.join(root, 'doc/learning-data-schema.json')

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
  const registers = new Set((item.example_sentences ?? []).map((e) => e.register))
  if (item.category === 'institutionalized' && item.register === 'casual') {
    if (!registers.has('casual')) warnings.push(`${item.id}: expected casual example`)
    return
  }
  if (registers.size < 1) warnings.push(`${item.id}: no examples`)
}
