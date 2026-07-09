/**
 * Load env for pipeline CLIs.
 * - `.env` (gitignored): optional local overrides
 * - `.env.example` (committed): public defaults (GAS Web App URL — not a secret)
 *
 * Anthropic API keys must stay in GAS Script Properties only.
 */
import { config } from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function loadFile(name: string) {
  const filePath = path.join(root, name)
  if (!fs.existsSync(filePath)) return
  config({ path: filePath, override: false })
}

loadFile('.env')
if (!process.env.GAS_ENDPOINT_URL) {
  loadFile('.env.example')
}
