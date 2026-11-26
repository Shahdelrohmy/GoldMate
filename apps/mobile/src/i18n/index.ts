
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import ar from './ar.json';
import en from './en.json';

export type Language = 'ar' | 'en';

const LANGUAGE_KEY = '@goldmate_language';

async function getSavedLanguage(): Promise<Language | null> {
  try {
    let savedLanguage: string | null = null;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        savedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
      }
    } else {
      savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    }

    return savedLanguage === 'ar' || savedLanguage === 'en'
      ? savedLanguage
      : null;
  } catch {
    return null;
  }
}

async function saveLanguage(language: Language) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANGUAGE_KEY, language);
      }
    } else {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    }
  } catch (error) {
    console.error('Failed to save language:', error);
  }
}

async function initializeI18n() {
  const savedLanguage = await getSavedLanguage();

  const startLanguage: Language =
    savedLanguage ?? (I18nManager.isRTL ? 'ar' : 'en');

  await i18n.use(initReactI18next).init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: startLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
}

const i18nReady = initializeI18n();

export { i18n, i18nReady };

export function useLanguage() {
  const { t, i18n: instance } = useTranslation();

  const language: Language =
    instance.language === 'ar' ? 'ar' : 'en';

  const setLanguage = async (next: Language) => {
    await i18nReady;

    await saveLanguage(next);
    await instance.changeLanguage(next);

    if (Platform.OS !== 'web') {
      const wantsRTL = next === 'ar';

      if (I18nManager.isRTL !== wantsRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(wantsRTL);
      }
    }
  };

  return { t, language, setLanguage };
}