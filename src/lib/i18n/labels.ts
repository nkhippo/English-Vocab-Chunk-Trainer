import type { TFunction } from 'i18next'
import type { Register } from '@/types/learning'

export function labelCategory(t: TFunction, category: string): string {
  const key = `enum.category.${category}`
  const translated = t(key)
  return translated === key ? category : translated
}

export function labelRegister(t: TFunction, register: Register | Register[] | string | undefined): string {
  if (!register) return '—'
  const list = Array.isArray(register) ? register : [register]
  return list
    .map((value) => {
      const key = `enum.register.${value}`
      const translated = t(key)
      return translated === key ? value : translated
    })
    .join(', ')
}

export function labelFrequencyHint(t: TFunction, hint: string | undefined): string {
  if (!hint) return '—'
  const key = `enum.frequency.${hint}`
  const translated = t(key)
  return translated === key ? hint : translated
}
