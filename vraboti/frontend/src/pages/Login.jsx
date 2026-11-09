import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/LanguageContext';
import AuthShell from '../components/AuthShell';
import { ErrorBox } from '../components/ui';
import { Arrow, Brief, Eye, EyeOff, UserIc } from '../components/Icons';

const ROLE = {
  CANDIDATE: { icon: <UserIc />, demo: 'elena@example.mk', home: '/jobs', switchTo: '/login', register: '/register', switchIcon: <Brief /> },
  EMPLOYER: { icon: <Brief />, demo: 'hr@pixellab.mk', home: '/admin', switchTo: '/login', register: '/register?role=EMPLOYER', switchIcon: <UserIc /> }
};
ROLE.CANDIDATE.switchTo = '/login/employer';

function LoginForm({ role }) {
  const r = ROLE[role];
  const { t } = useI18n();
  const k = (key) => t(`login.${role}.${key}`);
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return setError(t('login.missing'));
    setBusy(true);
    setError('');
    try {
      const res = await api.login(email, password);
      if (res.user.role !== role) {
        setError(k('wrongRole'));
        setBusy(false);
        return;
      }
      setSession(res);
      navigate(r.home);
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        navigate(`/verify?email=${encodeURIComponent(email.trim())}&role=${role}`);
        return;
      }
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="f">
          <label htmlFor="login-email">{t('common.email')}</label>
          <input id="login-email" type="email" autoComplete="email" placeholder={t('login.emailPh')}
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="f">
          <label htmlFor="login-pass">{t('common.password')}</label>
          <div className="pw">
            <input id="login-pass" type={show ? 'text' : 'password'} autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? t('common.hidePw') : t('common.showPw')}>
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
        <ErrorBox error={error} />
        <button className="btn pri lg" type="submit" disabled={busy}>{busy ? t('login.busy') : t('login.submit')}</button>
        <div className="demo">
          <span>{t('login.demo')}: <code>{r.demo}</code> / <code>demo1234</code></span>
          <button type="button" className="link" onClick={() => { setEmail(r.demo); setPassword('demo1234'); setError(''); }}>{t('login.fill')}</button>
        </div>
      </form>

      <div className="divider">{k('switchQ')}</div>
      <Link to={r.switchTo} className="btn lg switch-btn">
        {r.switchIcon}{k('switchLabel')}<Arrow />
      </Link>

      <p className="auth-foot">{t('login.noAccount')} <Link to={r.register}>{t('login.register')}</Link></p>
    </>
  );
}

export default function Login({ role = 'CANDIDATE' }) {
  const { user } = useAuth();
  const { t } = useI18n();
  if (user) return <Navigate to={user.role === 'EMPLOYER' ? '/admin' : '/jobs'} replace />;

  return (
    <AuthShell role={role}>
      <div className="auth-head">
        <span className="eyebrow">{ROLE[role].icon}{t(`login.${role}.eyebrow`)}</span>
        <h1>{t(`login.${role}.title`)}</h1>
        <p className="muted">{t(`login.${role}.lead`)}</p>
      </div>
      <LoginForm role={role} key={role} />
    </AuthShell>
  );
}
