import { useI18n } from '../i18n/LanguageContext';
import { CompanyLogo, Modal, ModalHeader } from './ui';

export default function JobDetailModal({ job, onClose, footer }) {
  const { t, tv, money, ago } = useI18n();
  return (
    <Modal onClose={onClose}>
      <ModalHeader lead={<CompanyLogo company={job.company} />} title={job.title}
        subtitle={`${job.company} · ${t('job.posted', { ago: ago(job.postedAt) })}`} onClose={onClose} />
      <div className="m-b">
        <div className="detail-meta">
          <div className="dm"><span>{t('job.location')}</span><b>{tv('city', job.location)}</b></div>
          <div className="dm"><span>{t('job.type')}</span><b>{tv('type', job.type)}</b></div>
          <div className="dm"><span>{t('job.salary')}</span><b className="num">{money(job.salaryMin)}–{money(job.salaryMax)} {t('money.currency')}</b></div>
        </div>
        <div className="prose">
          <h4>{t('job.about')}</h4>
          <p>{job.description}</p>
          {job.requirements?.length > 0 && (
            <>
              <h4>{t('job.reqs')}</h4>
              <ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </>
          )}
        </div>
      </div>
      <div className="m-f">{footer}</div>
    </Modal>
  );
}
