'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './en.json';
import es from './es.json';

export type AppLocale = 'en' | 'es';

export type TranslateFn = (key: string, vars?: Record<string, string>) => string;

const STORAGE_KEY = 'emisor-locale';

const dictionaries: Record<AppLocale, Record<string, string>> = {
  en: en as Record<string, string>,
  es: es as Record<string, string>,
};

function lookup(dict: Record<string, string>, key: string): string {
  return dict[key] ?? key;
}

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function applyReplacements(
  template: string,
  vars?: Record<string, string>,
): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{{${k}}}`, v),
    template,
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es') {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useMemo<TranslateFn>(() => {
    const dict = dictionaries[locale];
    return (key: string, vars?: Record<string, string>) =>
      applyReplacements(lookup(dict, key), vars);
  }, [locale]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'es' ? 'es' : 'en';
    }
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
