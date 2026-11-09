import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import { ErrorBox, Modal, ModalHeader } from './ui';
import { FileIc } from './Icons';

export default function ApplyModal({ job, onClose, onDone }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({ fullName: user.fullName, email: user.email, phone: user.phone || '', coverLetter: '' });
  const [cv, setCv] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (form.coverLetter.trim().length < 10) return setError(t('apply.errLetter'));
    if (cv && cv.size > 5 * 1024 * 1024) return setError(t('apply.errSize'));
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (cv) fd.append('cv', cv);
    setBusy(true);
    setError('');
    try {
      await api.apply(job.id, fd);
      onDone();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <ModalHeader title={t('apply.title')} subtitle={`${job.title} · ${job.company}`} onClose={onClose} />
        <div className="m-b">
          <div className="form">
            <div className="f"><label htmlFor="ap-n">{t('common.fullName')}</label><input id="ap-n" value={form.fullName} onChange={set('fullName')} /></div>
            <div className="f"><label htmlFor="ap-p">{t('common.phone')}</label><input id="ap-p" value={form.phone} onChange={set('phone')} /></div>
            <div className="f full"><label htmlFor="ap-e">{t('common.email')}</label><input id="ap-e" type="email" value={form.email} onChange={set('email')} /></div>
            <div className="f full">
              <label htmlFor="ap-l">{t('apply.letter')}</label>
              <textarea id="ap-l" value={form.coverLetter} onChange={set('coverLetter')} placeholder={t('apply.letterPh')} />
            </div>
            <div className="f full">
              <label>{t('apply.cv')}</label>
              <label className="file" htmlFor="ap-cv">
                <FileIc />
                {cv ? <span><b>{cv.name}</b> <span className="muted">{t('apply.cvAttached')}</span></span>
                    : <span><b>{t('apply.cvUpload')}</b> <span className="muted">{t('apply.cvHint')}</span></span>}
                <input id="ap-cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files[0] || null)} />
              </label>
            </div>
            <div className="full"><ErrorBox error={error} /></div>
          </div>
        </div>
        <div className="m-f">
          <button type="button" className="btn" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="btn pri" disabled={busy}>{busy ? t('apply.sending') : t('apply.send')}</button>
        </div>
      </form>
    </Modal>
  );
}
