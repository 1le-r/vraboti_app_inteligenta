import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import AuthShell from '../components/AuthShell';
import { ErrorBox } from '../components/ui';
import { Mail } from '../components/Icons';

const LENGTH = 6;
const COOLDOWN = 60;

function CodeInput({ digits, setDigits, disabled, bad }) {
  const { t } = useI18n();
  const refs = useRef([]);
  const focus = (i) => refs.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();

  function fill(from, text) {
    const nums = text.replace(/\D/g, '').slice(0, LENGTH - from).split('');
    if (!nums.length) return;
    const next = digits.slice();
    nums.forEach((d, k) => { next[from + k] = d; });
    setDigits(next);
    focus(from + nums.length);
  }

  function onChange(i, e) {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) {
      const next = digits.slice(); next[i] = ''; setDigits(next);
      return;
    }
    fill(i, v);
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      const next = digits.slice(); next[i - 1] = ''; setDigits(next);
      focus(i - 1);
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); focus(i - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1); }
  }

  useEffect(() => { focus(digits.findIndex((d) => !d)); }, []);

  return (
    <div className={`code ${bad ? 'bad' : ''}`} role="group" aria-label={t('verify.group')}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} id={`code-${i}`}
          className={d ? 'filled' : ''} value={d} disabled={disabled}
          inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} maxLength={LENGTH}
          aria-label={t('verify.digit', { n: i + 1 })}
          onChange={(e) => onChange(i, e)} onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => { e.preventDefault(); fill(0, e.clipboardData.getData('text')); }}
          onFocus={(e) => e.target.select()} />
      ))}
    </div>
  );
}

export default function Verify() {
  const { user, setSession } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const role = params.get('role') === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE';

  const [digits, setDigits] = useState(Array(LENGTH).fill(''));
  const [error, setError] = useState('');
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(COOLDOWN);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const code = digits.join('');

  useEffect(() => {
    if (code.length === LENGTH && !busy) submit(code);
  }, [code]);

  useEffect(() => {
    if (bad && !busy) document.getElementById('code-0')?.focus();
  }, [bad, busy]);

  if (user) return <Navigate to={user.role === 'EMPLOYER' ? '/admin' : '/jobs'} replace />;
  if (!email) return <Navigate to="/register" replace />;

  async function submit(value) {
    setBusy(true);
    setError('');
    setBad(false);
    try {
      const res = await api.verify(email, value);
      setSession(res);
      toast(t('verify.ok'));
      navigate(res.user.role === 'EMPLOYER' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.message);
      setBad(true);
      setDigits(Array(LENGTH).fill(''));
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setBad(false);
    try {
      await api.resendCode(email);
      setWait(COOLDOWN);
      setDigits(Array(LENGTH).fill(''));
      toast(t('verify.sent'));
    } catch (err) {
      setError(err.message);
    }
  }

  const mm = `${Math.floor(wait / 60)}:${String(wait % 60).padStart(2, '0')}`;

  return (
    <AuthShell role={role}>
      <div className="auth-head">
        <div className="mail-ic"><Mail /></div>
        <h1>{t('verify.title')}</h1>
        <p className="muted">{t('verify.leadA')}<span className="sent-to">{email}</span>{t('verify.leadB')}</p>
      </div>

      <form className="auth-form" onSubmit={(e) => { e.preventDefault(); if (code.length === LENGTH) submit(code); }}>
        <CodeInput digits={digits} setDigits={(d) => { setDigits(d); setBad(false); }} disabled={busy} bad={bad} />
        <ErrorBox error={error} />
        <button className="btn pri lg" type="submit" disabled={busy || code.length < LENGTH}>
          {busy ? t('verify.busy') : t('verify.submit')}
        </button>
      </form>

      <div className="resend">
        {t('verify.noCode')}
        {wait > 0
          ? <button className="link" type="button" disabled>{t('verify.resendIn')} <span className="num">{mm}</span></button>
          : <button className="link" type="button" onClick={resend}>{t('verify.resend')}</button>}
      </div>

      <p className="auth-foot">
        {t('verify.wrongEmail')} <Link to={role === 'EMPLOYER' ? '/register?role=EMPLOYER' : '/register'}>{t('verify.again')}</Link>
      </p>
    </AuthShell>
  );
}
