import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { callGasScript, parseArgs, sleep, readJson, writeJson, ensureDir } from '../lib/utils.ts'
import type { Dataset, SeedItem } from '../../src/types/learning.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const cefr = String(args.cefr ?? 'A2')
  const category = String(args.category ?? 'collocation')
  const batch = Number(args.batch ?? 30)
  const append = Boolean(args.append)

  const currentPath = path.join(root, 'data/current/items.json')
  const dataset = (await readJson<Dataset>(currentPath).catch(() => ({
    schema_version: '1.0.0',
    items: [],
  }))) as Dataset

  const outDir = path.join(root, 'data/staging')
  await ensureDir(outDir)
  const outPath = path.join(outDir, `${cefr}_${category}_seeds.json`)

  const stagingExisting = append
    ? ((await readJson<SeedItem[]>(outPath).catch(() => [])) as SeedItem[])
    : []

  const existingIds = [
    ...dataset.items.map((item) => item.id),
    ...stagingExisting.map((item) => item.id),
  ]

  console.log(`[generate-seed] cefr=${cefr} category=${category} batch=${batch} append=${append}`)
  console.log(`[generate-seed] existing ids: ${existingIds.length}`)

  await sleep(1000)
  const result = await callGasScript<{ items?: SeedItem[] } | SeedItem[]>('generate-seed', {
    category,
    cefr_level: cefr,
    batch_size: batch,
    existing_ids: existingIds,
  })

  if (!result.ok) {
    console.error('[generate-seed] GAS error:', result.error)
    process.exit(1)
  }

  const newItems = Array.isArray(result.data) ? result.data : (result.data.items ?? [])
  const byId = new Map<string, SeedItem>()
  for (const item of stagingExisting) byId.set(item.id, item)
  for (const item of newItems) byId.set(item.id, item)
  const merged = [...byId.values()]

  await writeJson(outPath, merged)
  console.log(
    `[generate-seed] wrote ${merged.length} items (+${newItems.length} new) → ${outPath}${result.cached ? ' (cached)' : ''}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
