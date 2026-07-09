#!/usr/bin/env tsx
/**
 * Concatenate gas/*.js into drive-paste/Code.gs for manual Drive deploy fallback.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const gasDir = path.join(root, 'gas')
const outPath = path.join(gasDir, 'drive-paste', 'Code.gs')

const parts = ['main.js', 'cache.js', 'claude.js', 'handlers.js']

const footer = `
/**
 * Prefer Script Properties UI. This helper is only a one-shot fallback:
 * replace YOUR_KEY_HERE, run setAnthropicApiKey once, then delete the key string and save again.
 */
function setAnthropicApiKey() {
  var key = 'YOUR_KEY_HERE'
  if (!key || key === 'YOUR_KEY_HERE') {
    throw new Error('Replace YOUR_KEY_HERE with your Anthropic API key, run once, then remove it.')
  }
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key)
  Logger.log('ANTHROPIC_API_KEY saved to Script Properties')
}

function hasAnthropicApiKey() {
  var key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY')
  Logger.log(key ? 'ANTHROPIC_API_KEY is set (len=' + key.length + ')' : 'ANTHROPIC_API_KEY is NOT set')
}
`

async function main() {
  const chunks: string[] = [
    '/** Auto-generated from gas/*.js — run: pnpm run build:gas-paste */\n',
  ]
  for (const file of parts) {
    const text = await fs.readFile(path.join(gasDir, file), 'utf8')
    chunks.push(`// --- ${file} ---\n`, text.trim(), '\n\n')
  }
  chunks.push(footer.trim(), '\n')
  await fs.writeFile(outPath, chunks.join(''))
  console.log(`[build:gas-paste] wrote ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
