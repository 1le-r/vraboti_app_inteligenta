import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useI18n } from '../i18n/LanguageContext';
import { STATUS } from '../constants';
import ApplicationModal from '../components/ApplicationModal';
import { Empty, ErrorBox, Loading } from '../components/ui';
import { ApplicationRow } from './Dashboard';

export default function AdminApplications() {
  const { version, refresh } = useOutletContext();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const jobId = params.get('jobId') || '';
  const status = params.get('status') || '';

  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => { api.adminJobs().then(setJobs).catch(() => {}); }, [version]);
  useEffect(() => {
    api.adminApplications({ jobId, status }).then(setApps).catch((e) => setError(e.message));
  }, [jobId, status, version]);

  const setFilter = (k, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v); else p.delete(k);
    setParams(p, { replace: true });
  };

  return (
    <>
      <div className="head">
        <div><h1>{t('aapps.title')}</h1><p className="muted">{t('aapps.lead')}</p></div>
        <div className="toolbar">
          <select value={jobId} onChange={(e) => setFilter('jobId', e.target.value)} aria-label={t('aapps.job')}>
            <option value="">{t('aapps.allJobs')}</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <select value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label={t('aapps.status')}>
            <option value="">{t('aapps.allStatuses')}</option>
            {Object.keys(STATUS).map((k) => <option key={k} value={k}>{t(`status.${k}`)}</option>)}
          </select>
        </div>
      </div>
      <ErrorBox error={error} />
      {!apps && !error ? <Loading /> : apps && (
        <div className="panel">
          {apps.length
            ? apps.map((a) => <ApplicationRow key={a.id} app={a} onOpen={() => setOpenId(a.id)} />)
            : <Empty title={t('aapps.none')} text={t('aapps.noneText')} />}
        </div>
      )}
      {openId && (
        <ApplicationModal id={openId} onClose={() => { setOpenId(null); refresh(); }}
          onChanged={(a) => setApps((list) => list?.map((x) => (x.id === a.id ? a : x)))} />
      )}
    </>
  );
}
