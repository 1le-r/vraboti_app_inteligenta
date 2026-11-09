import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import AuthShell from '../components/AuthShell';
import { ErrorBox } from '../components/ui';
import { Eye, EyeOff } from '../components/Icons';

export default function Register() {
  const { user, register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = params.get('role') === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE';

  const [f, setF] = useState({ fullName: '', company: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to={user.role === 'EMPLOYER' ? '/admin' : '/jobs'} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await register({ ...f, role });
      navigate(`/verify?email=${encodeURIComponent(res.email)}&role=${role}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const employer = role === 'EMPLOYER';
  return (
    <AuthShell role={role}>
      <div className="auth-head">
        <h1>{t('register.title')}</h1>
        <p className="muted">{employer ? t('register.leadEmp') : t('register.leadCand')}</p>
      </div>

      <div className="seg full" role="tablist">
        <button type="button" className={!employer ? 'on' : ''} onClick={() => setParams({}, { replace: true })}>{t('register.segCand')}</button>
        <button type="button" className={employer ? 'on' : ''} onClick={() => setParams({ role: 'EMPLOYER' }, { replace: true })}>{t('register.segEmp')}</button>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="f"><label htmlFor="r-n">{t('common.fullName')}</label>
          <input id="r-n" autoComplete="name" value={f.fullName} onChange={set('fullName')} /></div>
        {employer && (
          <div className="f"><label htmlFor="r-c">{t('common.company')}</label>
            <input id="r-c" autoComplete="organization" value={f.company} onChange={set('company')} /></div>
        )}
        <div className="f"><label htmlFor="r-e">{t('common.email')}</label>
          <input id="r-e" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
        <div className="f"><label htmlFor="r-p">{t('common.password')}</label>
          <div className="pw">
            <input id="r-p" type={show ? 'text' : 'password'} autoComplete="new-password" value={f.password} onChange={set('password')} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? t('common.hidePw') : t('common.showPw')}>{show ? <EyeOff /> : <Eye />}</button>
          </div>
          <div className="hint">{t('register.pwHint')}</div>
        </div>
        <ErrorBox error={error} />
        <button className="btn pri lg" type="submit" disabled={busy}>{busy ? t('register.busy') : t('register.submit')}</button>
      </form>

      <p className="auth-foot">{t('register.have')} <Link to={employer ? '/login/employer' : '/login'}>{t('register.login')}</Link></p>
    </AuthShell>
  );
}
