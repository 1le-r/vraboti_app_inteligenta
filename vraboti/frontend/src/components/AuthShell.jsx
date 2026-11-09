import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useI18n } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { CompanyLogo } from './ui';
import { Flow, Megaphone, Users } from './Icons';

export function Brand() {
  const { t } = useI18n();
  return <Link to="/login" className="brand"><i>{t('brand.letter')}</i>{t('brand')}</Link>;
}

function CandidatePanel() {
  const { t, tv, money } = useI18n();
  const [jobs, setJobs] = useState(null);
  useEffect(() => { api.jobs({}).then(setJobs).catch(() => setJobs([])); }, []);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="brand-title">{t('panel.cand.titleA')}<em>{t('panel.cand.titleEm')}</em>{t('panel.cand.titleB')}</h2>
        <p className="brand-lead">{t('panel.cand.lead')}</p>
      </div>
      {jobs?.length > 0 && (
        <>
          <div className="brand-stack">
            {jobs.slice(0, 3).map((j, i) => (
              <div className="brand-card" key={j.id} style={{ '--i': i }}>
                <CompanyLogo company={j.company} />
                <div className="t"><b>{j.title}</b><span>{j.company} · {tv('city', j.location)}</span></div>
                <span className="s num">{t('panel.cand.from', { amount: money(j.salaryMin) })}</span>
              </div>
            ))}
          </div>
          <p className="brand-foot"><span className="live" /><b className="num">{jobs.length}</b> {t('panel.cand.count')}</p>
        </>
      )}
    </>
  );
}

function EmployerPanel() {
  const { t } = useI18n();
  const feats = [
    [<Megaphone key="m" />, 'f1'],
    [<Users key="u" />, 'f2'],
    [<Flow key="f" />, 'f3']
  ];
  const flow = ['NEW', 'REVIEW', 'INTERVIEW', 'HIRED'];
  const cls = { NEW: 's-new', REVIEW: 's-review', INTERVIEW: 's-interview', HIRED: 's-hired' };
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="brand-title">{t('panel.emp.titleA')}<em>{t('panel.emp.titleEm')}</em>{t('panel.emp.titleB')}</h2>
        <p className="brand-lead">{t('panel.emp.lead')}</p>
      </div>
      <ul className="brand-feats">
        {feats.map(([ic, k]) => (
          <li key={k}><span className="fi">{ic}</span><div><b>{t(`panel.emp.${k}t`)}</b><span>{t(`panel.emp.${k}d`)}</span></div></li>
        ))}
      </ul>
      <div className="flow">
        <small>{t('panel.emp.flow')}</small>
        {flow.map((s, i) => (
          <span key={s} style={{ display: 'contents' }}>
            <span className={`pill ${cls[s]}`}>{t(`status.${s}`)}</span>
            {i < flow.length - 1 && <span className="arr">→</span>}
          </span>
        ))}
      </div>
    </>
  );
}

export default function AuthShell({ role, children }) {
  const employer = role === 'EMPLOYER';
  return (
    <div className={`auth ${employer ? 'is-employer' : ''}`}>
      <aside className="auth-side">
        <div className="auth-side-in">
          <Brand />
          {employer ? <EmployerPanel /> : <CandidatePanel />}
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-lang"><LanguageSwitcher /></div>
        <div className="auth-box">
          <div className="auth-mobile-brand"><Brand /></div>
          {children}
        </div>
      </main>
    </div>
  );
}
