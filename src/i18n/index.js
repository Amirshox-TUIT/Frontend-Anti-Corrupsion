import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations.js';
import { getStoredLanguage, setStoredLanguage } from '../services/storage.js';

i18n.use(initReactI18next).init({
  resources: translations,
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  setStoredLanguage(language);
});

export default i18n;
