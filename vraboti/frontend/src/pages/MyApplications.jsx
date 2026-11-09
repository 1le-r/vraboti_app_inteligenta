import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageContext';
import { CompanyLogo, Empty, StatusPill } from '../components/ui';

const DONE = ['HIRED', 'REJECTED'];

export default function MyApplications() {
  const { myApps } = useOutletContext();
  const { t, tv, ago } = useI18n();
  const [filter, setFilter] = useState('all');

  const list = myApps.filter((a) =>
    filter === 'all' || (filter === 'active' ? !DONE.includes(a.status) : DONE.includes(a.status)));

  return (
    <>
      <div className="head">
        <div><h1>{t('my.title')}</h1><p className="muted">{t('my.lead')}</p></div>
        <div className="seg">
          {[['all', t('common.all')], ['active', t('my.active')], ['done', t('my.done')]].map(([k, l]) => (
            <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="panel">
        {list.length ? list.map((a) => (
          <div className="row" key={a.id}>
            <div className="main">
              <CompanyLogo company={a.company} />
              <div>
                <b>{a.jobTitle}</b>
                <div className="sub">{a.company} · {tv('city', a.location)} · {t('my.appliedAgo', { ago: ago(a.appliedAt) })}</div>
              </div>
            </div>
            <div className="acts"><StatusPill status={a.status} /></div>
          </div>
        )) : (
          <Empty title={myApps.length ? t('my.emptyGroup') : t('my.emptyNone')}
            text={t('my.emptyText')}
            action={<Link className="btn pri" to="/jobs">{t('my.browse')}</Link>} />
        )}
      </div>
    </>
  );
}
