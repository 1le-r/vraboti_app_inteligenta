import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import ApplicationModal from '../components/ApplicationModal';
import { Avatar, ErrorBox, Loading, StatusPill } from '../components/ui';

export function ApplicationRow({ app, onOpen }) {
  const { ago } = useI18n();
  return (
    <div className="row click" onClick={onOpen} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="main">
        <Avatar name={app.fullName} />
        <div><b>{app.fullName}</b><div className="sub">{app.jobTitle} · {ago(app.appliedAt)}</div></div>
      </div>
      <div className="acts"><StatusPill status={app.status} /></div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { version, refresh } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message));
  }, [version]);

  if (error) return <ErrorBox error={error} />;
  if (!stats) return <Loading />;
  const max = Math.max(1, ...stats.perJob.map((x) => x.count));

  return (
    <>
      <div className="head">
        <div><h1>{t('dash.hello', { name: user.fullName.split(' ')[0] })}</h1><p className="muted">{t('dash.lead', { company: user.company })}</p></div>
      </div>
      <div className="stats">
        <div className="stat"><span>{t('dash.active')}</span><b>{stats.activeJobs}</b></div>
        <div className="stat"><span>{t('dash.total')}</span><b>{stats.totalApplications}</b></div>
        <div className="stat"><span>{t('dash.new')}</span><b style={{ color: 'var(--blue)' }}>{stats.newApplications}</b></div>
        <div className="stat"><span>{t('dash.interviews')}</span><b style={{ color: 'var(--accent)' }}>{stats.interviews}</b></div>
      </div>
      <div className="grid2">
        <div className="panel">
          <div className="panel-h"><h3>{t('dash.recent')}</h3><Link className="btn sm" to="/admin/applications">{t('common.all')}</Link></div>
          {stats.recent.length
            ? stats.recent.map((a) => <ApplicationRow key={a.id} app={a} onOpen={() => setOpenId(a.id)} />)
            : <div className="empty">{t('dash.noApps')}</div>}
        </div>
        <div className="panel">
          <div className="panel-h"><h3>{t('dash.perJob')}</h3></div>
          <div className="bars">
            {stats.perJob.length ? stats.perJob.map((x) => (
              <div key={x.jobId}>
                <div className="bar-l"><span>{x.title}</span><b className="num">{x.count}</b></div>
                <div className="bar"><i style={{ width: `${(x.count / max) * 100}%` }} /></div>
              </div>
            )) : <p className="muted">{t('dash.noData')}</p>}
          </div>
        </div>
      </div>
      {openId && <ApplicationModal id={openId} onClose={() => { setOpenId(null); refresh(); }} />}
    </>
  );
}
