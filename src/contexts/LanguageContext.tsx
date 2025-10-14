import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import all translation files
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import it from '../locales/it.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';

export type Language = 'fr' | 'en' | 'de' | 'es' | 'it' | 'zh' | 'ja';

export const LANGUAGE_CONFIG = {
  fr: { name: 'Français', flag: '🇫🇷', translations: fr },
  en: { name: 'English', flag: '🇬🇧', translations: en },
  de: { name: 'Deutsch', flag: '🇩🇪', translations: de },
  es: { name: 'Español', flag: '🇪🇸', translations: es },
  it: { name: 'Italiano', flag: '🇮🇹', translations: it },
  zh: { name: '中文', flag: '🇨🇳', translations: zh },
  ja: { name: '日本語', flag: '🇯🇵', translations: ja },
};

const STORAGE_KEY = 'app_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: typeof LANGUAGE_CONFIG;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getBrowserLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact match or language prefix
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ja')) return 'ja';
  
  // Default to English if not found
  return 'en';
}

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in LANGUAGE_CONFIG) {
    return stored as Language;
  }
  return getBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = LANGUAGE_CONFIG[language].translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language ${language}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Handle pluralization
    if (params && 'count' in params) {
      const count = params.count as number;
      if (count !== 1 && value.includes('_plural')) {
        // Try to find plural version
        const pluralKey = key + '_plural';
        const pluralKeys = pluralKey.split('.');
        let pluralValue: any = LANGUAGE_CONFIG[language].translations;
        
        for (const k of pluralKeys) {
          if (pluralValue && typeof pluralValue === 'object' && k in pluralValue) {
            pluralValue = pluralValue[k];
          } else {
            break;
          }
        }
        
        if (typeof pluralValue === 'string') {
          value = pluralValue;
        }
      }
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, paramValue]) => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), String(paramValue));
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGE_CONFIG }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
