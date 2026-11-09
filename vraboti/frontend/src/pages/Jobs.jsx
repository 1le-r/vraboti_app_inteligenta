import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import { CATEGORIES, CITIES, TYPES } from '../constants';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import ApplyModal from '../components/ApplyModal';
import { Empty, ErrorBox, Loading } from '../components/ui';
import { Search } from '../components/Icons';

export default function Jobs() {
  const { user } = useAuth();
  const toast = useToast();
  const { t, tv, plural } = useI18n();
  const navigate = useNavigate();
  const { myApps, saved, setSaved, reload } = useOutletContext();

  const [filters, setFilters] = useState({ q: '', category: '', location: '', type: '' });
  const [onlySaved, setOnlySaved] = useState(false);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [applyTo, setApplyTo] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.jobs(filters).then((j) => { setJobs(j); setError(''); }).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  const applied = new Set(myApps.map((a) => a.jobId));
  const savedSet = new Set(saved);
  const list = (jobs || []).filter((j) => !onlySaved || savedSet.has(j.id));
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  async function toggleSave(id) {
    try {
      setSaved(await (savedSet.has(id) ? api.unsave(id) : api.save(id)));
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <>
      <div className="head">
        <div>
          <h1>{t('jobs.welcome', { name: user.fullName.split(' ')[0] })}</h1>
          <p className="muted">{t('jobs.lead')}</p>
        </div>
      </div>

      <div className="search">
        <div className="q"><Search />
          <input placeholder={t('jobs.searchPh')} value={filters.q} onChange={(e) => set('q', e.target.value)} aria-label={t('jobs.search')} />
        </div>
        <select value={filters.location} onChange={(e) => set('location', e.target.value)} aria-label={t('common.city')}>
          <option value="">{t('jobs.allCities')}</option>
          {CITIES.map((c) => <option key={c} value={c}>{tv('city', c)}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => set('type', e.target.value)} aria-label={t('jobs.type')}>
          <option value="">{t('jobs.allTypes')}</option>
          {TYPES.map((c) => <option key={c} value={c}>{tv('type', c)}</option>)}
        </select>
      </div>

      <div className="chips">
        {['', ...CATEGORIES].map((c) => (
          <button key={c || 'all'} className={`chip ${filters.category === c && !onlySaved ? 'on' : ''}`}
            onClick={() => { set('category', c); setOnlySaved(false); }}>{c ? tv('cat', c) : t('common.all')}</button>
        ))}
        <button className={`chip ${onlySaved ? 'on' : ''}`} onClick={() => setOnlySaved(!onlySaved)}>{t('jobs.saved', { n: saved.length })}</button>
      </div>

      <ErrorBox error={error} />
      {!jobs && !error && <Loading />}
      {jobs && (
        <>
          <p className="muted" style={{ marginBottom: 12, fontSize: '.88rem' }}>
            <span className="num">{list.length}</span> {plural(list.length, 'jobs.one', 'jobs.many')}
          </p>
          {list.length ? (
            <div className="jobs">
              {list.map((j) => (
                <JobCard key={j.id} job={j} saved={savedSet.has(j.id)} applied={applied.has(j.id)}
                  onOpen={() => setOpen(j)} onToggleSave={() => toggleSave(j.id)} />
              ))}
            </div>
          ) : (
            <div className="panel">
              <Empty title={t('jobs.emptyTitle')} text={t('jobs.emptyText')}
                action={<button className="btn" onClick={() => { setFilters({ q: '', category: '', location: '', type: '' }); setOnlySaved(false); }}>{t('jobs.clear')}</button>} />
            </div>
          )}
        </>
      )}

      {open && (
        <JobDetailModal job={open} onClose={() => setOpen(null)} footer={
          applied.has(open.id) ? (
            <>
              <span className="applied" style={{ alignSelf: 'center' }}>{t('jobs.alreadyApplied')}</span>
              <button className="btn" onClick={() => navigate('/my-applications')}>{t('jobs.seeApps')}</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => toggleSave(open.id)}>{savedSet.has(open.id) ? t('jobs.savedBtn') : t('jobs.saveBtn')}</button>
              <button className="btn pri" onClick={() => { setApplyTo(open); setOpen(null); }}>{t('jobs.apply')}</button>
            </>
          )
        } />
      )}

      {applyTo && (
        <ApplyModal job={applyTo} onClose={() => setApplyTo(null)}
          onDone={() => { setApplyTo(null); reload(); toast(t('jobs.sent')); }} />
      )}
    </>
  );
}
