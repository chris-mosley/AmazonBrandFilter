import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import de from "assets/_locales/de/messages.json";
import en from "assets/_locales/en/messages.json";
import es from "assets/_locales/es/messages.json";

i18next.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
