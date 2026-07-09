#!/usr/bin/env tsx
/**
 * Run A2 seed generation for all categories (Step 3).
 * Large categories are split into multiple batches with --append.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const PLAN: { category: string; target: number; chunk: number }[] = [
  { category: 'word', target: 1500, chunk: 75 },
  { category: 'collocation', target: 500, chunk: 50 },
  { category: 'phrasal_verb', target: 80, chunk: 40 },
  { category: 'idiom', target: 30, chunk: 30 },
  { category: 'compound', target: 200, chunk: 50 },
  { category: 'binomial', target: 30, chunk: 30 },
  { category: 'institutionalized', target: 50, chunk: 50 },
  { category: 'other', target: 40, chunk: 40 },
]

function runSeed(category: string, batch: number, append: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      'run',
      'generate:seed',
      '--',
      '--cefr=A2',
      `--category=${category}`,
      `--batch=${batch}`,
    ]
    if (append) args.push('--append')

    const child = spawn('pnpm', args, { cwd: root, stdio: 'inherit', shell: true })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`generate:seed failed for ${category} batch=${batch} code=${code}`))
    })
  })
}

async function main() {
  for (const { category, target, chunk } of PLAN) {
    console.log(`\n[batch-a2-seeds] === ${category} (target ${target}) ===`)
    let generated = 0
    let round = 0
    while (generated < target) {
      const batch = Math.min(chunk, target - generated)
      const append = round > 0
      await runSeed(category, batch, append)
      generated += batch
      round += 1
      console.log(`[batch-a2-seeds] ${category}: progress ${generated}/${target}`)
    }
  }
  console.log('\n[batch-a2-seeds] all categories complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
