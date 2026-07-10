export type CheckmarkCount = 0 | 1 | 2 | 3

export type CheckmarkMode = 'browse' | 'mode_a' | 'mode_b'

export interface CheckmarkStore {
  schema_version: 1
  browse: Record<string, CheckmarkCount>
  mode_a: Record<string, CheckmarkCount>
  mode_b: Record<string, CheckmarkCount>
}

export const CHECKMARK_WEIGHTS: Record<CheckmarkCount, number> = {
  0: 8,
  1: 4,
  2: 2,
  3: 1,
}
