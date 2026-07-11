import type { TFunction } from 'i18next'
import type { Register, SkillFocus } from '@/types/learning'

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

export function labelSkillFocus(t: TFunction, skillFocus: SkillFocus | string | undefined): string {
  if (!skillFocus) return t('itemDetail.unset')
  const key = `enum.skillFocus.${skillFocus}`
  const translated = t(key)
  return translated === key ? skillFocus : translated
}

export function metaValue(t: TFunction, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return t('itemDetail.unset')
  return String(value)
}
