import { useEffect, useRef, useState } from 'react';
import { LANGS, useI18n } from '../i18n/LanguageContext';
import { FLAGS } from './Flags';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const Flag = FLAGS[lang];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button type="button" className="lang-btn" onClick={() => setOpen(!open)}
        aria-haspopup="menu" aria-expanded={open} aria-label={`${t('lang.label')}: ${t(`lang.${lang}`)}`}>
        <Flag />
        <span className="lang-code">{lang === 'mk' ? 'МК' : 'EN'}</span>
        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LANGS.map((l) => {
            const F = FLAGS[l];
            return (
              <button key={l} type="button" role="menuitemradio" aria-checked={lang === l}
                onClick={() => { setLang(l); setOpen(false); }}>
                <F /><span>{t(`lang.${l}`)}</span>
                {lang === l && <svg className="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
