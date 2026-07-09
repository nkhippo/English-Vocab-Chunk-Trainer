import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson, writeJson } from '../lib/utils.ts'
import type { Dataset, LearningItem } from '../../src/types/learning.ts'
import { validateDataset } from '../lib/validate.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const newRel = String(args.new ?? '')
  const intoRel = String(args.into ?? 'data/current/items.json')
  const overwrite = Boolean(args.overwrite)

  if (!newRel) {
    console.error('Usage: pnpm run merge -- --new=data/staging/A2_final.json --into=data/current/items.json')
    process.exit(1)
  }

  const newPath = path.resolve(root, newRel)
  const intoPath = path.resolve(root, intoRel)
  const incomingRaw = await readJson<LearningItem[] | Dataset>(newPath)
  const incoming = Array.isArray(incomingRaw) ? incomingRaw : incomingRaw.items
  const current = (await readJson<Dataset>(intoPath).catch(() => ({
    schema_version: '1.0.0',
    items: [] as LearningItem[],
    insights: [],
  }))) as Dataset

  const map = new Map(current.items.map((item) => [item.id, item]))
  let added = 0
  let overwritten = 0
  let skipped = 0

  for (const item of incoming) {
    if (map.has(item.id)) {
      if (overwrite) {
        map.set(item.id, item)
        overwritten += 1
      } else {
        console.warn(`[merge] duplicate id skipped: ${item.id}`)
        skipped += 1
      }
    } else {
      map.set(item.id, item)
      added += 1
    }
  }

  const merged: Dataset = {
    ...current,
    schema_version: current.schema_version ?? '1.0.0',
    generated_at: new Date().toISOString(),
    items: [...map.values()],
    total_items: map.size,
    insights: current.insights ?? [],
  }

  const report = await validateDataset(merged)
  if (!report.ok) {
    console.error('[merge] schema validation failed:')
    for (const err of report.errors) console.error(' -', err)
    process.exit(1)
  }

  await writeJson(intoPath, merged)
  console.log(`[merge] added=${added} overwritten=${overwritten} skipped=${skipped} total=${merged.items.length}`)
  console.log(`[merge] wrote ${intoPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
