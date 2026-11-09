import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { CATEGORIES, CITIES, TYPES } from '../constants';
import { ErrorBox, Modal, ModalHeader } from './ui';

export default function JobFormModal({ job, onClose, onSaved }) {
  const { user } = useAuth();
  const { t, tv } = useI18n();
  const [f, setF] = useState(() => job
    ? { ...job, requirements: (job.requirements || []).join('\n') }
    : { title: '', company: user.company || '', location: CITIES[0], type: TYPES[0], category: CATEGORIES[0],
        salaryMin: '', salaryMax: '', description: '', requirements: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    const min = Number(f.salaryMin), max = Number(f.salaryMax);
    if (!f.title.trim() || !f.company.trim() || !f.description.trim()) return setError(t('jf.errRequired'));
    if (!f.salaryMin || !f.salaryMax || min > max) return setError(t('jf.errSalary'));
    const payload = {
      title: f.title, company: f.company, location: f.location, type: f.type, category: f.category,
      salaryMin: min, salaryMax: max, description: f.description,
      requirements: f.requirements.split('\n').map((s) => s.trim()).filter(Boolean)
    };
    setBusy(true);
    setError('');
    try {
      const saved = job ? await api.updateJob(job.id, payload) : await api.createJob(payload);
      onSaved(saved, !job);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const select = (id, key, group, options) => (
    <select id={id} value={f[key]} onChange={set(key)}>
      {options.map((o) => <option key={o} value={o}>{tv(group, o)}</option>)}
    </select>
  );

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <ModalHeader title={job ? t('jf.titleEdit') : t('jf.titleNew')}
          subtitle={job ? t('jf.subEdit') : t('jf.subNew')} onClose={onClose} />
        <div className="m-b">
          <div className="form">
            <div className="f full"><label htmlFor="jf-t">{t('jf.title')}</label><input id="jf-t" value={f.title} onChange={set('title')} placeholder={t('jf.titlePh')} /></div>
            <div className="f"><label htmlFor="jf-co">{t('common.company')}</label><input id="jf-co" value={f.company} onChange={set('company')} /></div>
            <div className="f"><label htmlFor="jf-cat">{t('jf.category')}</label>{select('jf-cat', 'category', 'cat', CATEGORIES)}</div>
            <div className="f"><label htmlFor="jf-l">{t('jf.location')}</label>{select('jf-l', 'location', 'city', CITIES)}</div>
            <div className="f"><label htmlFor="jf-ty">{t('jf.type')}</label>{select('jf-ty', 'type', 'type', TYPES)}</div>
            <div className="f"><label htmlFor="jf-min">{t('jf.min')}</label><input id="jf-min" type="number" min="0" step="1000" value={f.salaryMin} onChange={set('salaryMin')} placeholder="40000" /></div>
            <div className="f"><label htmlFor="jf-max">{t('jf.max')}</label><input id="jf-max" type="number" min="0" step="1000" value={f.salaryMax} onChange={set('salaryMax')} placeholder="55000" /></div>
            <div className="f full"><label htmlFor="jf-d">{t('jf.desc')}</label><textarea id="jf-d" value={f.description} onChange={set('description')} /></div>
            <div className="f full">
              <label htmlFor="jf-r">{t('jf.reqs')}</label>
              <textarea id="jf-r" value={f.requirements} onChange={set('requirements')} placeholder={t('jf.reqsPh')} />
              <div className="hint">{t('jf.reqsHint')}</div>
            </div>
            <div className="full"><ErrorBox error={error} /></div>
          </div>
        </div>
        <div className="m-f">
          <button type="button" className="btn" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn pri" disabled={busy}>{busy ? t('common.saving') : job ? t('common.save') : t('jf.publish')}</button>
        </div>
      </form>
    </Modal>
  );
}
