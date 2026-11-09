import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Avatar } from './ui';
import { Logout, Plus } from './Icons';

export default function Header({ onNewJob, counts = {} }) {
  const { user, isEmployer, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const tabs = isEmployer
    ? [['/admin', t('nav.dashboard')], ['/admin/jobs', t('nav.myJobs')], ['/admin/applications', t('nav.applications'), counts.newApps]]
    : [['/jobs', t('nav.jobs')], ['/my-applications', t('nav.myApps'), counts.myApps], ['/profile', t('nav.profile')]];

  return (
    <header className="top">
      <div className="wrap">
        <div className="logo"><i>{t('brand.letter')}</i>{t('brand')}</div>
        <nav className="tabs">
          {tabs.map(([to, label, c]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `tab ${isActive ? 'on' : ''}`}>
              {label}{c ? <span className="cnt num">{c}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          {isEmployer && (
            <button className="btn pri sm" onClick={onNewJob}><Plus /><span>{t('nav.newJob')}</span></button>
          )}
          <LanguageSwitcher />
          <Avatar name={user.fullName} />
          <div className="who-txt">
            <b>{user.fullName}</b>
            <span className="muted">{isEmployer ? `${t('role.employer')} · ${user.company}` : t('role.candidate')}</span>
          </div>
          <button className="btn ghost sm" title={t('common.logout')} aria-label={t('common.logout')}
            onClick={() => { logout(); navigate(isEmployer ? '/login/employer' : '/login'); }}>
            <Logout />
          </button>
        </div>
      </div>
    </header>
  );
}
