import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ja from './locales/ja.json'
import en from './locales/en.json'

const STORAGE_KEY = 'vct.language'

export function getStoredLanguage(): 'ja' | 'en' {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'en' ? 'en' : 'ja'
}

export function setStoredLanguage(lang: 'ja' | 'en') {
  localStorage.setItem(STORAGE_KEY, lang)
}

void i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'ja',
  interpolation: { escapeValue: false },
})

export default i18n
