import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson } from './lib/utils.ts'
import type { Dataset } from '../src/types/learning.ts'
import { validateDataset } from './lib/validate.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const inputRel = String(args.input ?? 'data/current/items.json')
  const inputPath = path.resolve(root, inputRel)
  const dataset = await readJson<Dataset>(inputPath)
  const report = await validateDataset(dataset)

  console.log(`[validate] ${inputPath}`)
  console.log(`[validate] items=${dataset.items?.length ?? 0}`)

  if (report.warnings.length) {
    console.log('[validate] warnings:')
    for (const w of report.warnings) console.log(' -', w)
  }

  if (!report.ok) {
    console.error('[validate] FAILED')
    for (const e of report.errors) console.error(' -', e)
    process.exit(1)
  }

  console.log('[validate] OK')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
