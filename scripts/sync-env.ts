#!/usr/bin/env tsx
/**
 * Sync GAS URL lines in local .env from committed .env.example.
 * Safe to run after pull when GAS endpoint changes.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const examplePath = path.join(root, '.env.example')
const envPath = path.join(root, '.env')

const KEYS = ['GAS_ENDPOINT_URL', 'VITE_GAS_ENDPOINT_URL'] as const

function parseEnv(text: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1))
  }
  return map
}

function main() {
  if (!fs.existsSync(examplePath)) {
    console.error('[env:sync] missing .env.example')
    process.exit(1)
  }

  const example = parseEnv(fs.readFileSync(examplePath, 'utf8'))
  const lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').split('\n')
    : fs.readFileSync(examplePath, 'utf8').split('\n')

  let changed = false
  const out = lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return line
    const eq = trimmed.indexOf('=')
    if (eq === -1) return line
    const key = trimmed.slice(0, eq)
    if (!KEYS.includes(key as (typeof KEYS)[number])) return line
    const next = example.get(key)
    if (!next || next === trimmed.slice(eq + 1)) return line
    changed = true
    return `${key}=${next}`
  })

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${out.join('\n').replace(/\n?$/, '')}\n`)
    console.log('[env:sync] created .env from .env.example')
    return
  }

  if (!changed) {
    console.log('[env:sync] .env already up to date')
    return
  }

  fs.writeFileSync(envPath, `${out.join('\n').replace(/\n?$/, '')}\n`)
  console.log('[env:sync] updated GAS URL in .env')
}

main()
