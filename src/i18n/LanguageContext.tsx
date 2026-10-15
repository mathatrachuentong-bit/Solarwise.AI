import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'solarwise_language_preference';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'th' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  const t = (key: keyof typeof translations.en, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = (dict[key] ?? translations.en[key] ?? key) as string;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number): string => {
    return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US').format(amount);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
