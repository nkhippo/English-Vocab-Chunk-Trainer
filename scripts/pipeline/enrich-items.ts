import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { callGasScript, parseArgs, sleep, readJson, writeJson, ensureDir } from '../lib/utils.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

interface Enrichable {
  id: string
  [key: string]: unknown
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const inputRel = String(args.input ?? '')
  if (!inputRel) {
    console.error('Usage: pnpm run generate:enrichment -- --input=data/staging/A2_validated.json')
    process.exit(1)
  }

  const inputPath = path.resolve(root, inputRel)
  const items = await readJson<Enrichable[]>(inputPath)
  const resumePath = path.join(root, 'data/staging/.enrich-resume.json')
  const doneIds = new Set<string>(
    (await readJson<string[]>(resumePath).catch(() => [])) as string[],
  )

  const outPath = inputPath.replace(/\.json$/i, '_enriched.json')
  const enriched: Enrichable[] = (await readJson<Enrichable[]>(outPath).catch(() => [])) as Enrichable[]
  const enrichedIds = new Set(enriched.map((i) => i.id))

  console.log(`[enrich] ${items.length} items, resume done=${doneIds.size}`)

  for (const [i, item] of items.entries()) {
    if (doneIds.has(item.id) || enrichedIds.has(item.id)) {
      console.log(`[enrich] skip ${item.id}`)
      continue
    }

    console.log(`[enrich] ${i + 1}/${items.length} ${item.id}`)
    await sleep(1000)
    const result = await callGasScript<Record<string, unknown>>('enrich-item', {
      schema_version: '1.1.0',
      item: {
        id: item.id,
        surface: item.surface,
        category: item.category,
        cefr_level: item.cefr_level,
        translations_ja: item.translations_ja,
      },
    })

    if (!result.ok) {
      console.error(`[enrich] failed ${item.id}:`, result.error)
      await writeJson(resumePath, [...doneIds])
      process.exit(1)
    }

    const merged = { ...item, ...result.data }
    enriched.push(merged)
    enrichedIds.add(item.id)
    doneIds.add(item.id)
    await writeJson(outPath, enriched)
    await writeJson(resumePath, [...doneIds])
  }

  await ensureDir(path.dirname(outPath))
  await writeJson(outPath, enriched)
  console.log(`[enrich] wrote ${enriched.length} items → ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
