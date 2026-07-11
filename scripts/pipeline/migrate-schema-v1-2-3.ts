/**
 * Migrate items.json to synonym/antonym nuance_contrast_ja schema.
 * Dataset schema_version becomes 1.2.3 (1.2.2 was already used for Insight official merge).
 *
 * Usage: pnpm run migrate:v1.2.3
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')
const itemsPath = path.join(root, 'data/current/items.json')

interface LooseEntry {
  item?: string
  difference_ja?: string
  difference_en?: string
  nuance_contrast_ja?: string
  example_en?: string
  example_ja?: string
  [key: string]: unknown
}

interface LooseRelated {
  example_en?: string
  example_ja?: string
  [key: string]: unknown
}

interface LooseItem {
  synonyms?: LooseEntry[]
  antonyms?: LooseEntry[]
  related_uses?: LooseRelated[]
  hypernyms?: unknown
  hyponyms?: unknown
  [key: string]: unknown
}

interface LooseDataset {
  schema_version?: string
  generated_at?: string
  items: LooseItem[]
  [key: string]: unknown
}

function migrateContrastList(entries: LooseEntry[] | undefined, kind: 'synonym' | 'antonym') {
  let migrated = 0
  if (!Array.isArray(entries)) return migrated
  for (const entry of entries) {
    if (entry.difference_ja && !entry.nuance_contrast_ja) {
      entry.nuance_contrast_ja = entry.difference_ja
      delete entry.difference_ja
      migrated++
    }
    if (entry.difference_en !== undefined) {
      delete entry.difference_en
    }
    if (entry.example_en === undefined) entry.example_en = ''
    if (entry.example_ja === undefined) entry.example_ja = ''
    // drop legacy register on synonyms if present
    if ('register' in entry) delete entry.register
    void kind
  }
  return migrated
}

function main() {
  const dataset = JSON.parse(fs.readFileSync(itemsPath, 'utf-8')) as LooseDataset

  let migratedItems = 0
  let migratedSynonyms = 0
  let migratedAntonyms = 0
  let removedHypernyms = 0
  let removedHyponyms = 0

  for (const item of dataset.items) {
    let touched = false

    const synCount = migrateContrastList(item.synonyms, 'synonym')
    if (synCount > 0) {
      migratedSynonyms += synCount
      touched = true
    } else if (Array.isArray(item.synonyms)) {
      for (const syn of item.synonyms) {
        if (syn.example_en === undefined || syn.example_ja === undefined || syn.difference_en !== undefined) {
          if (syn.example_en === undefined) syn.example_en = ''
          if (syn.example_ja === undefined) syn.example_ja = ''
          if (syn.difference_en !== undefined) delete syn.difference_en
          if ('register' in syn) delete syn.register
          touched = true
        }
      }
    }

    const antCount = migrateContrastList(item.antonyms, 'antonym')
    if (antCount > 0) {
      migratedAntonyms += antCount
      touched = true
    } else if (Array.isArray(item.antonyms)) {
      for (const ant of item.antonyms) {
        if (ant.example_en === undefined || ant.example_ja === undefined) {
          if (ant.example_en === undefined) ant.example_en = ''
          if (ant.example_ja === undefined) ant.example_ja = ''
          touched = true
        }
      }
    }

    if (Array.isArray(item.related_uses)) {
      for (const ru of item.related_uses) {
        if (ru.example_en === undefined) {
          ru.example_en = ''
          touched = true
        }
        if (ru.example_ja === undefined) {
          ru.example_ja = ''
          touched = true
        }
      }
    }

    if (item.hypernyms !== undefined) {
      removedHypernyms++
      delete item.hypernyms
      touched = true
    }
    if (item.hyponyms !== undefined) {
      removedHyponyms++
      delete item.hyponyms
      touched = true
    }

    if (touched) migratedItems++
  }

  dataset.schema_version = '1.2.3'
  dataset.generated_at = new Date().toISOString()
  fs.writeFileSync(itemsPath, `${JSON.stringify(dataset, null, 2)}\n`)

  console.log('Migration complete:')
  console.log(`  Items touched: ${migratedItems}`)
  console.log(`  Synonyms migrated: ${migratedSynonyms}`)
  console.log(`  Antonyms migrated: ${migratedAntonyms}`)
  console.log(`  Hypernyms removed from: ${removedHypernyms}`)
  console.log(`  Hyponyms removed from: ${removedHyponyms}`)
  console.log('  Note: example_en/example_ja are empty for existing entries.')
  console.log("  Naoya's design chat will populate these separately.")
  console.log('  schema_version set to 1.2.3 (1.2.2 already used for Insight official merge).')
}

main()
