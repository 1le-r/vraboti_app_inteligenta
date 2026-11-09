import { useEffect } from 'react';
import { STATUS } from '../constants';
import { useI18n } from '../i18n/LanguageContext';
import { initials, logoColors } from '../utils';
import { Close } from './Icons';

export function Modal({ onClose, size, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size || ''}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose, lead }) {
  const { t } = useI18n();
  return (
    <div className="m-h">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
        {lead}
        <div style={{ minWidth: 0 }}>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>
      {onClose && <button type="button" className="x" onClick={onClose} aria-label={t('common.close')}><Close /></button>}
    </div>
  );
}

export function CompanyLogo({ company }) {
  const [bg, fg] = logoColors(company);
  return <div className="logo-sq" style={{ background: bg, color: fg }}>{initials(company)}</div>;
}

export const Avatar = ({ name, size }) => (
  <div className="avatar" style={size ? { width: size, height: size, fontSize: size / 2.8 } : undefined}>
    {initials(name)}
  </div>
);

export function StatusPill({ status }) {
  const { t } = useI18n();
  return <span className={`pill ${STATUS[status].cls}`}>{t(`status.${status}`)}</span>;
}

export function Loading({ text }) {
  const { t } = useI18n();
  return <div className="loading"><div className="spin" />{text || t('common.loading')}</div>;
}

export const ErrorBox = ({ error }) => (error ? <div className="alert" role="alert">{error}</div> : null);

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <p style={{ marginTop: 14 }}>{action}</p>}
    </div>
  );
}
