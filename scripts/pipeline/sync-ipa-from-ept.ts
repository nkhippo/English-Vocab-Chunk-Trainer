/**
 * Sync word-category IPA from EPT wordlist.
 * Usage: pnpm run sync:ipa-ept
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Dataset } from '../../src/types/learning.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

function loadWordlistMap(csvPath: string): Map<string, string> {
  const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0])
  const headIdx = header.indexOf('headword')
  const ipaIdx = header.indexOf('ipa')
  if (headIdx < 0 || ipaIdx < 0) {
    throw new Error(`Unexpected CSV header in ${csvPath}`)
  }

  const map = new Map<string, string>()
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    const headword = cols[headIdx]?.trim().toLowerCase()
    const ipa = cols[ipaIdx]?.trim()
    if (headword && ipa) map.set(headword, ipa)
  }
  return map
}

/** Minimal CSV line parser that respects quoted fields. */
function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }
    current += ch
  }
  result.push(current)
  return result
}

function main() {
  const csvPath = path.join(root, 'data/reference/ept/wordlist_GA_a1a2_plus_phonics.csv')
  const itemsPath = path.join(root, 'data/current/items.json')
  if (!fs.existsSync(csvPath)) {
    console.error(`[sync-ipa] Missing ${csvPath}`)
    process.exit(1)
  }

  const wordlistMap = loadWordlistMap(csvPath)
  const dataset = JSON.parse(fs.readFileSync(itemsPath, 'utf-8')) as Dataset
  let updated = 0

  for (const item of dataset.items) {
    if (item.category !== 'word') continue
    const eptIpa = wordlistMap.get(item.surface.toLowerCase())
    if (eptIpa && eptIpa !== item.ipa_careful) {
      console.log(`  ${item.surface}: ${item.ipa_careful} → ${eptIpa}`)
      item.ipa_careful = eptIpa
      delete item.ipa_connected
      updated++
    } else if (eptIpa) {
      delete item.ipa_connected
    }
  }

  dataset.generated_at = new Date().toISOString()
  fs.writeFileSync(itemsPath, `${JSON.stringify(dataset, null, 2)}\n`)
  console.log(`[sync-ipa] Updated ${updated} word items with EPT IPA`)
}

main()
