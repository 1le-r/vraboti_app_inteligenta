import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import { STATUS } from '../constants';
import { Avatar, ErrorBox, Loading, Modal, ModalHeader } from './ui';
import { FileIc } from './Icons';

export default function ApplicationModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const { t, date } = useI18n();
  const [app, setApp] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.openApplication(id)
      .then((a) => { setApp(a); onChanged?.(a); })
      .catch((e) => setError(e.message));
  }, [id]);

  async function setStatus(status) {
    try {
      const a = await api.setStatus(id, status);
      setApp(a);
      onChanged?.(a);
      toast(t('app.statusToast', { s: t(`status.${status}`) }));
    } catch (e) {
      setError(e.message);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(app.email);
      toast(t('app.copied'));
    } catch {
      toast(app.email);
    }
  }

  return (
    <Modal onClose={onClose}>
      {!app ? (
        <div className="m-b">{error ? <ErrorBox error={error} /> : <Loading />}</div>
      ) : (
        <>
          <ModalHeader lead={<Avatar name={app.fullName} size={52} />} title={app.fullName}
            subtitle={t('app.for', { job: app.jobTitle })} onClose={onClose} />
          <div className="m-b">
            <div className="kv">
              <span>{t('common.email')}</span><b>{app.email}</b>
              <span>{t('common.phone')}</span><b>{app.phone || '—'}</b>
              <span>{t('app.applied')}</span><b>{date(app.appliedAt)}</b>
              <span>CV</span>
              <b>{app.cvFileName
                ? <button className="link" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
                    onClick={() => api.downloadCv(app.id, app.cvFileName).catch((e) => setError(e.message))}>
                    <FileIc />{app.cvFileName}
                  </button>
                : <span className="muted">{t('app.noCv')}</span>}</b>
            </div>
            <div className="prose"><h4>{t('apply.letter')}</h4></div>
            <div className="letter">{app.coverLetter}</div>
            <div className="prose"><h4>{t('app.status')}</h4></div>
            <div className="status-pick">
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} className={`pill ${v.cls} ${app.status === k ? 'sel' : ''}`} onClick={() => setStatus(k)}>
                  {t(`status.${k}`)}
                </button>
              ))}
            </div>
            {error && <div style={{ marginTop: 12 }}><ErrorBox error={error} /></div>}
          </div>
          <div className="m-f">
            <button className="btn" onClick={copyEmail}>{t('app.copy')}</button>
            <button className="btn pri" onClick={onClose}>{t('common.done')}</button>
          </div>
        </>
      )}
    </Modal>
  );
}
