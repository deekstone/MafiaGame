import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ar from './locales/ar.json'

const STORAGE_KEY = 'i18nextLng'

function applyRtl(lng: string) {
  const root = document.documentElement
  if (lng.startsWith('ar')) {
    root.dir = 'rtl'
    root.lang = 'ar'
  } else {
    root.dir = 'ltr'
    root.lang = 'en'
  }
}

// Apply RTL immediately from localStorage on load (before i18n init).
// This fixes RTL persisting on refresh; init/initialized can run before the detector sets language.
const storedLng = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
if (storedLng && storedLng.startsWith('ar')) {
  applyRtl('ar')
} else {
  applyRtl('en')
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

i18n.on('languageChanged', (lng) => {
  applyRtl(lng)
})

i18n.on('initialized', () => {
  applyRtl(i18n.language?.startsWith('ar') ? 'ar' : 'en')
})

export default i18n
