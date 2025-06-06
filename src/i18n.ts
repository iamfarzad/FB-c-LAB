import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
// import LanguageDetector from 'i18next-browser-languagedetector'; // Optional: To detect user language

const supportedLngs = ['en', 'es', 'fr', 'de']; // Define supported languages

i18n
  .use(HttpBackend) // Loads translations from your server/public path
  // .use(LanguageDetector) // Optional: Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    lng: 'en', // Default language if detection fails or is not used
    fallbackLng: 'en', // Fallback language if selected language is missing translations
    supportedLngs: supportedLngs, // Explicitly set supported languages
    ns: ['translation'], // Namespace for your translations
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to your translation files
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: true, // Recommended: Enables Suspense for translations
    },
    // debug: process.env.NODE_ENV === 'development', // Enable debug output in development
  });

export default i18n;
