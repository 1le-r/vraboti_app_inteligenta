import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import { CITIES } from '../constants';
import { Avatar, ErrorBox } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { myApps, saved } = useOutletContext();
  const toast = useToast();
  const { t, tv } = useI18n();
  const [f, setF] = useState({
    fullName: user.fullName, email: user.email, phone: user.phone || '', title: user.title || '',
    city: user.city || CITIES[0], skills: user.skills || '', about: user.about || ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setUser(await api.updateProfile(f));
      toast(t('profile.saved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const skills = (user.skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <div className="head"><div><h1>{t('profile.title')}</h1><p className="muted">{t('profile.lead')}</p></div></div>
      <div className="profile">
        <div className="pcard">
          <Avatar name={user.fullName} />
          <h2>{user.fullName}</h2>
          <p className="muted">{[user.title, tv('city', user.city)].filter(Boolean).join(' · ') || t('profile.addTitle')}</p>
          <div className="skills">{skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>
          <p className="muted num" style={{ marginTop: 16, fontSize: '.88rem' }}>{t('profile.stats', { a: myApps.length, s: saved.length })}</p>
        </div>
        <form className="panel" onSubmit={submit} noValidate>
          <div className="panel-h"><h3>{t('profile.personal')}</h3></div>
          <div className="m-b">
            <div className="form">
              <div className="f"><label htmlFor="pf-n">{t('common.fullName')}</label><input id="pf-n" value={f.fullName} onChange={set('fullName')} /></div>
              <div className="f"><label htmlFor="pf-t">{t('profile.profession')}</label><input id="pf-t" value={f.title} onChange={set('title')} /></div>
              <div className="f"><label htmlFor="pf-e">{t('common.email')}</label><input id="pf-e" type="email" value={f.email} onChange={set('email')} /></div>
              <div className="f"><label htmlFor="pf-p">{t('common.phone')}</label><input id="pf-p" value={f.phone} onChange={set('phone')} /></div>
              <div className="f"><label htmlFor="pf-c">{t('common.city')}</label>
                <select id="pf-c" value={f.city} onChange={set('city')}>{CITIES.map((c) => <option key={c} value={c}>{tv('city', c)}</option>)}</select></div>
              <div className="f"><label htmlFor="pf-s">{t('profile.skills')}</label><input id="pf-s" value={f.skills} onChange={set('skills')} />
                <div className="hint">{t('profile.skillsHint')}</div></div>
              <div className="f full"><label htmlFor="pf-a">{t('profile.about')}</label><textarea id="pf-a" value={f.about} onChange={set('about')} /></div>
              <div className="full"><ErrorBox error={error} /></div>
            </div>
          </div>
          <div className="m-f"><button className="btn pri" type="submit" disabled={busy}>{busy ? t('common.saving') : t('profile.save')}</button></div>
        </form>
      </div>
    </>
  );
}
