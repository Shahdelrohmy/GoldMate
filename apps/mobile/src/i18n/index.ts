import { DevSettings, I18nManager } from 'react-native'
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import ar from './ar.json'
import en from './en.json'

export type Language = 'ar' | 'en'

// TEMPORARY setup so the screens can run. B owns the final i18n + RTL setup
// (i18next + expo-localization, device language, saving the choice).
// The start language follows the native layout direction, so changing language = change direction + reload.
const startLanguage: Language = I18nManager.isRTL ? 'ar' : 'en'

void i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: startLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export { i18n }

export function useLanguage() {
  const { t, i18n: instance } = useTranslation()
  const language: Language = instance.language === 'ar' ? 'ar' : 'en'
  const setLanguage = (next: Language) => {
    void instance.changeLanguage(next)
    const wantsRTL = next === 'ar'
    if (I18nManager.isRTL !== wantsRTL) {
      I18nManager.allowRTL(true)
      I18nManager.forceRTL(wantsRTL)
      // Direction only changes after a reload. In production B must use expo-updates (Updates.reloadAsync).
      DevSettings.reload()
    }
  }
  return { t, language, setLanguage }
}
