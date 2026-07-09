import fs from 'node:fs/promises'
import path from 'node:path'

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue
    const body = raw.slice(2)
    const eq = body.indexOf('=')
    if (eq === -1) {
      out[body] = true
    } else {
      out[body.slice(0, eq)] = body.slice(eq + 1)
    }
  }
  return out
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function readJson<T>(filePath: string): Promise<T> {
  const text = await fs.readFile(filePath, 'utf8')
  return JSON.parse(text) as T
}

export async function writeJson(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

export type GasPath =
  | 'generate-seed'
  | 'enrich-item'
  | 'generate-examples'
  | 'generate-insight'
  | 'validate-cefr'
  | 'review-writing'

export interface GasError {
  ok: false
  error: { code: string; message: string }
}

export interface GasSuccess<T> {
  ok: true
  data: T
  cached?: boolean
}

export type GasResult<T> = GasSuccess<T> | GasError

export async function callGasScript<T>(gasPath: GasPath, body: unknown): Promise<GasResult<T>> {
  const endpoint = process.env.GAS_ENDPOINT_URL
  if (!endpoint) {
    return {
      ok: false,
      error: {
        code: 'missing_env',
        message: 'GAS_ENDPOINT_URL is not set (.env optional — defaults from .env.example)',
      },
    }
  }

  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}path=${encodeURIComponent(gasPath)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 280_000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        ok: false,
        error: { code: `http_${response.status}`, message: await response.text() },
      }
    }

    const json = (await response.json()) as GasResult<T>
    return json
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'network',
        message: err instanceof Error ? err.message : String(err),
      },
    }
  } finally {
    clearTimeout(timeout)
  }
}
