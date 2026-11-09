import { useI18n } from '../i18n/LanguageContext';
import { CompanyLogo } from './ui';
import { Pin, Star } from './Icons';

export function Salary({ job }) {
  const { t, money } = useI18n();
  return <span className="sal num">{money(job.salaryMin)}–{money(job.salaryMax)} <small>{t('money.perMonth')}</small></span>;
}

export default function JobCard({ job, saved, applied, onOpen, onToggleSave }) {
  const { t, tv, ago } = useI18n();
  return (
    <article className="job" tabIndex={0} onClick={onOpen} onKeyDown={(e) => e.key === 'Enter' && onOpen()}>
      <div className="job-top">
        <CompanyLogo company={job.company} />
        <div className="t">
          <h3>{job.title}</h3>
          <p className="muted" style={{ fontSize: '.9rem' }}>{job.company}</p>
        </div>
        <button className={`star ${saved ? 'on' : ''}`} aria-label={saved ? t('jobs.unsave') : t('jobs.saveBtn')}
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}>
          <Star filled={saved} />
        </button>
      </div>
      <div className="tags">
        <span className="tag"><Pin />{tv('city', job.location)}</span>
        <span className="tag">{tv('type', job.type)}</span>
        <span className="tag">{tv('cat', job.category)}</span>
      </div>
      <div className="job-foot">
        <Salary job={job} />
        {applied
          ? <span className="applied">{t('jobs.applied')}</span>
          : <span className="muted" style={{ fontSize: '.82rem' }}>{ago(job.postedAt)}</span>}
      </div>
    </article>
  );
}
