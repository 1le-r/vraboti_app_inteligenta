import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import JobFormModal from '../components/JobFormModal';
import JobDetailModal from '../components/JobDetailModal';
import { CompanyLogo, Empty, ErrorBox, Loading, Modal, ModalHeader } from '../components/ui';
import { Edit, Plus, Trash } from '../components/Icons';

export default function AdminJobs() {
  const toast = useToast();
  const { t, tv, ago, plural } = useI18n();
  const navigate = useNavigate();
  const { version, refresh, openNewJob } = useOutletContext();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.adminJobs().then(setJobs).catch((e) => setError(e.message));
  }, [version]);

  async function toggle(j) {
    try {
      const u = await api.toggleJob(j.id);
      setJobs(jobs.map((x) => (x.id === u.id ? u : x)));
      toast(u.active ? t('ajobs.toastActive') : t('ajobs.toastClosed'));
      refresh();
    } catch (e) { toast(e.message); }
  }

  async function confirmDelete() {
    try {
      await api.deleteJob(deleting.id);
      setDeleting(null);
      toast(t('ajobs.toastDeleted'));
      refresh();
    } catch (e) { toast(e.message); }
  }

  if (error) return <ErrorBox error={error} />;
  if (!jobs) return <Loading />;

  const apps = (n) => plural(n, 'ajobs.appOne', 'ajobs.appMany');

  return (
    <>
      <div className="head">
        <div><h1>{t('ajobs.title')}</h1><p className="muted">{t('ajobs.lead')}</p></div>
        <button className="btn pri" onClick={openNewJob}><Plus />{t('nav.newJob')}</button>
      </div>
      <div className="panel">
        {jobs.length ? jobs.map((j) => (
          <div className="row" key={j.id}>
            <div className="main" style={{ cursor: 'pointer' }} onClick={() => setViewing(j)}>
              <CompanyLogo company={j.company} />
              <div><b>{j.title}</b><div className="sub">{j.company} · {tv('city', j.location)} · {ago(j.postedAt)}</div></div>
            </div>
            <div className="acts">
              <span className={`pill ${j.active ? 's-interview' : 's-off'}`}>{j.active ? t('ajobs.open') : t('ajobs.closed')}</span>
              <button className="btn sm" onClick={() => navigate(`/admin/applications?jobId=${j.id}`)}>
                <span className="num">{j.applicationCount}</span>&nbsp;{apps(j.applicationCount)}
              </button>
              <button className="btn sm" onClick={() => toggle(j)}>{j.active ? t('ajobs.close') : t('ajobs.activate')}</button>
              <button className="btn sm" onClick={() => setEditing(j)} aria-label={t('common.edit')}><Edit /></button>
              <button className="btn sm danger" onClick={() => setDeleting(j)} aria-label={t('common.delete')}><Trash /></button>
            </div>
          </div>
        )) : (
          <Empty title={t('ajobs.none')} text={t('ajobs.noneText')} action={<button className="btn pri" onClick={openNewJob}>{t('nav.newJob')}</button>} />
        )}
      </div>

      {viewing && (
        <JobDetailModal job={viewing} onClose={() => setViewing(null)} footer={
          <>
            <button className="btn" onClick={() => { setEditing(viewing); setViewing(null); }}>{t('common.edit')}</button>
            <button className="btn pri" onClick={() => setViewing(null)}>{t('common.close')}</button>
          </>
        } />
      )}

      {editing && (
        <JobFormModal job={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); toast(t('ajobs.toastSaved')); refresh(); }} />
      )}

      {deleting && (
        <Modal size="sm" onClose={() => setDeleting(null)}>
          <ModalHeader title={t('ajobs.delTitle')} />
          <div className="m-b">
            <p>
              {t('ajobs.delA', { title: deleting.title })}
              {deleting.applicationCount > 0 && t('ajobs.delWith', { n: deleting.applicationCount, apps: apps(deleting.applicationCount) })}
              {t('ajobs.delB')}
            </p>
          </div>
          <div className="m-f">
            <button className="btn" onClick={() => setDeleting(null)}>{t('common.cancel')}</button>
            <button className="btn pri" style={{ background: 'var(--red)', borderColor: 'var(--red)' }} onClick={confirmDelete}>{t('common.delete')}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
