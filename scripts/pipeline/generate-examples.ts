import '../lib/load-env.ts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { callGasScript, parseArgs, sleep, readJson, writeJson, ensureDir } from '../lib/utils.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

interface ExampleSentenceCandidate {
  register?: string
  [key: string]: unknown
}

function normalizeExampleRegisters(examples: unknown[]): ExampleSentenceCandidate[] {
  return (examples as ExampleSentenceCandidate[]).map((ex) => ({
    ...ex,
    register: ex.register === 'casual' ? 'informal' : ex.register,
  }))
}

interface ExampleItem {
  id: string
  surface: string
  category: string
  cefr_level: string
  translations_ja?: string[]
  example_sentences?: unknown[]
  [key: string]: unknown
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const inputRel = String(args.input ?? '')
  if (!inputRel) {
    console.error('Usage: pnpm run generate:examples -- --input=data/staging/A2_validated_enriched.json')
    process.exit(1)
  }

  const inputPath = path.resolve(root, inputRel)
  const items = await readJson<ExampleItem[]>(inputPath)
  const outPath = inputPath.replace(/\.json$/i, '_with_examples.json')
  const needsReviewPath = path.join(root, 'data/staging/needs_manual_review.json')
  await ensureDir(path.dirname(needsReviewPath))

  const output: ExampleItem[] = []
  const needsReview: ExampleItem[] = (await readJson<ExampleItem[]>(needsReviewPath).catch(() => [])) as ExampleItem[]

  for (const [i, item] of items.entries()) {
    console.log(`[examples] ${i + 1}/${items.length} ${item.id}`)
    let examples: unknown[] | null = null

    for (let attempt = 1; attempt <= 3; attempt++) {
      await sleep(1000)
      const gen = await callGasScript<{ example_sentences?: unknown[] }>('generate-examples', {
        schema_version: '1.1.3',
        item: {
          id: item.id,
          surface: item.surface,
          category: item.category,
          cefr_level: item.cefr_level,
          translations_ja: item.translations_ja,
          collocation_pattern: item.collocation_pattern,
        },
      })

      if (!gen.ok) {
        console.warn(`[examples] generate failed attempt ${attempt}:`, gen.error.message)
        continue
      }

      const candidate = normalizeExampleRegisters(gen.data.example_sentences ?? [])
      await sleep(1000)
      const validation = await callGasScript<{ ok?: boolean; violations?: unknown[] }>('validate-cefr', {
        schema_version: '1.1.0',
        validator_version: 'v4',
        item_id: item.id,
        cefr_level: item.cefr_level,
        example_sentences: candidate,
      })

      if (!validation.ok) {
        console.warn(`[examples] validate call failed attempt ${attempt}:`, validation.error.message)
        continue
      }

      const violations = validation.data.violations ?? []
      const passed = validation.data.ok !== false && violations.length === 0
      if (passed) {
        examples = candidate
        break
      }

      console.warn(
        `[examples] CEFR violations on attempt ${attempt}, violations:`,
        JSON.stringify(violations, null, 2),
      )
    }

    if (!examples) {
      needsReview.push(item)
      await writeJson(needsReviewPath, needsReview)
      console.warn(`[examples] quarantined ${item.id}`)
      continue
    }

    const normalizedExamples = normalizeExampleRegisters(examples)
    const derivedRegisters = Array.from(
      new Set(
        normalizedExamples
          .map((e) => e.register)
          .filter((r): r is string => Boolean(r)),
      ),
    )

    output.push({
      ...item,
      example_sentences: normalizedExamples,
      register: derivedRegisters,
    })
    await writeJson(outPath, output)
  }

  console.log(`[examples] wrote ${output.length} → ${outPath}`)
  console.log(`[examples] needs manual review: ${needsReview.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
