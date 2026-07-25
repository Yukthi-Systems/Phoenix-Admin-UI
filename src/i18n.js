/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en/translation.json";
import frTranslation from "./locales/fr/translation.json";
const savedLanguage = localStorage.getItem("lang") || "en";

i18n
  .use(LanguageDetector) // detects browser language
  .use(initReactI18next) // passes i18n instance to react-i18next
  .init({
    lng: savedLanguage,
    fallbackLng: "en", // default language
    debug: false,
    interpolation: {
      escapeValue: false, // react already escapes
    },
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
    },
  });

export default i18n;
