import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dict } from './translations';
import { setApiLang } from '../api/client';

const KEY = 'vraboti_lang';
export const LANGS = ['mk', 'en'];

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {}
  return 'mk';
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  setApiLang(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(KEY, lang); } catch {}
  }, [lang]);

  const setLang = useCallback((l) => { if (LANGS.includes(l)) setLangState(l); }, []);

  const value = useMemo(() => {
    const table = dict[lang];

    const t = (key, vars) => {
      let s = table[key] ?? dict.mk[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
      return s;
    };

    const tv = (group, value) => (value ? table[`${group}.${value}`] ?? value : value);

    const locale = lang === 'en' ? 'en-GB' : 'mk-MK';
    const money = (n) => Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'de-DE');
    const date = (iso) => new Date(iso).toLocaleDateString(locale);
    const plural = (n, one, many) => (n === 1 ? t(one) : t(many));
    const ago = (iso) => {
      const d = (Date.now() - new Date(iso)) / 864e5;
      if (d < 1) return t('ago.today');
      if (d < 2) return t('ago.yesterday');
      if (d < 30) return t('ago.days', { n: Math.floor(d) });
      return date(iso);
    };

    return { lang, setLang, t, tv, money, date, plural, ago };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useI18n = () => useContext(LanguageContext);
