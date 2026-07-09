export type GasPath =
  | 'generate-seed'
  | 'enrich-item'
  | 'generate-examples'
  | 'generate-insight'
  | 'validate-cefr'
  | 'review-writing'

export interface GasErrorBody {
  ok: false
  error: {
    code: string
    message: string
  }
}

export interface GasSuccessBody<T> {
  ok: true
  data: T
  cached?: boolean
}

export type GasResponse<T> = GasSuccessBody<T> | GasErrorBody

function resolveEndpoint(): string {
  const url = import.meta.env.VITE_GAS_ENDPOINT_URL as string | undefined
  if (!url) {
    throw new Error('VITE_GAS_ENDPOINT_URL is not set')
  }
  return url
}

export async function callGas<T>(path: GasPath, body: unknown): Promise<GasResponse<T>> {
  const endpoint = resolveEndpoint()
  const origin =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : ''
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}path=${encodeURIComponent(path)}${originParam}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    return {
      ok: false,
      error: {
        code: `http_${response.status}`,
        message: `GAS HTTP ${response.status}`,
      },
    }
  }

  return (await response.json()) as GasResponse<T>
}
