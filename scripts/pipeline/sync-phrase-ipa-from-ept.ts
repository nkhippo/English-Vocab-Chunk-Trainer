/**
 * Sync phrase IPA connected forms from EPT connected_speech, or synthesize from wordlist.
 * Usage: pnpm run sync:phrase-ipa-ept
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Dataset } from '../../src/types/learning.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

interface ConnectedSpeechEntry {
  w: string
  ipa: string
  rp_ipa?: string
}

function loadWordlistMap(csvPath: string): Map<string, string> {
  const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0])
  const headIdx = header.indexOf('headword')
  const ipaIdx = header.indexOf('ipa')
  const map = new Map<string, string>()
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line)
    const headword = cols[headIdx]?.trim().toLowerCase()
    const ipa = cols[ipaIdx]?.trim()
    if (headword && ipa) map.set(headword, ipa)
  }
  return map
}

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

/** Join word IPAs without spaces. Advanced linking remains a follow-up task. */
export function synthesizeConnectedIPA(surface: string, wordlistMap: Map<string, string>): string {
  const words = surface.split(/\s+/)
  const ipas = words.map((w) => {
    const lower = w.toLowerCase()
    const stripped = lower.replace(/^[^a-z']+|[^a-z']+$/g, '')
    const lettersOnly = lower.replace(/[^a-z]/g, '')
    const candidates = [
      lower,
      stripped,
      lettersOnly,
      stripped.replace(/'s$/, ''),
      stripped.replace(/n't$/, ''),
    ]
    for (const key of candidates) {
      if (!key) continue
      const ipa = wordlistMap.get(key)
      if (ipa) return ipa.replace(/\//g, '')
    }
    const fallback = candidates.find(Boolean) ?? w
    return `[${fallback}]`
  })
  return `/${ipas.join('')}/`
}

function main() {
  const csvPath = path.join(root, 'data/reference/ept/wordlist_GA_a1a2_plus_phonics.csv')
  const csPath = path.join(root, 'data/reference/ept/connected_speech.json')
  const itemsPath = path.join(root, 'data/current/items.json')

  if (!fs.existsSync(csvPath) || !fs.existsSync(csPath)) {
    console.error('[sync-phrase-ipa] Missing EPT reference files under data/reference/ept/')
    process.exit(1)
  }

  const wordlistMap = loadWordlistMap(csvPath)
  const connectedSpeech = JSON.parse(fs.readFileSync(csPath, 'utf-8')) as ConnectedSpeechEntry[]
  const csMap = new Map(
    connectedSpeech.map((cs) => [cs.w.toLowerCase(), { ipa: cs.ipa, rp_ipa: cs.rp_ipa }]),
  )

  const dataset = JSON.parse(fs.readFileSync(itemsPath, 'utf-8')) as Dataset
  let matched = 0
  let synthesized = 0
  const unmatched: string[] = []

  for (const item of dataset.items) {
    if (item.category === 'word') continue
    const eptMatch = csMap.get(item.surface.toLowerCase())
    if (eptMatch) {
      console.log(`  ${item.surface}: EPT connected = ${eptMatch.ipa}`)
      item.ipa_connected = eptMatch.ipa
      matched++
    } else {
      const synth = synthesizeConnectedIPA(item.surface, wordlistMap)
      console.log(`  ${item.surface}: synthesized = ${synth}`)
      item.ipa_connected = synth
      synthesized++
      unmatched.push(item.surface)
    }
  }

  dataset.generated_at = new Date().toISOString()
  fs.writeFileSync(itemsPath, `${JSON.stringify(dataset, null, 2)}\n`)
  console.log(`[sync-phrase-ipa] Matched from EPT: ${matched}`)
  console.log(`[sync-phrase-ipa] Synthesized: ${synthesized}`)
  if (unmatched.length) {
    console.log('[sync-phrase-ipa] Unmatched (synthesized):', unmatched.join(', '))
  }
}

main()
