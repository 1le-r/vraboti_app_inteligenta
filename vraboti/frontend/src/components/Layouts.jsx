import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/LanguageContext';
import Header from './Header';
import JobFormModal from './JobFormModal';
import { Loading } from './ui';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to={role === 'EMPLOYER' ? '/login/employer' : '/login'} replace />;
  if (user.role !== role) return <Navigate to={user.role === 'EMPLOYER' ? '/admin' : '/jobs'} replace />;
  return children;
}

export function CandidateLayout() {
  const [myApps, setMyApps] = useState([]);
  const [saved, setSaved] = useState([]);

  const reload = useCallback(() => {
    api.myApplications().then(setMyApps).catch(() => {});
    api.saved().then(setSaved).catch(() => {});
  }, []);
  useEffect(reload, [reload]);

  return (
    <Guard role="CANDIDATE">
      <Header counts={{ myApps: myApps.length }} />
      <main className="wrap"><Outlet context={{ myApps, saved, setSaved, reload }} /></main>
    </Guard>
  );
}

export function EmployerLayout() {
  const toast = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [newJob, setNewJob] = useState(false);
  const [version, setVersion] = useState(0);
  const [newApps, setNewApps] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    api.stats().then((s) => setNewApps(s.newApplications)).catch(() => {});
  }, [version]);

  return (
    <Guard role="EMPLOYER">
      <Header counts={{ newApps }} onNewJob={() => setNewJob(true)} />
      <main className="wrap"><Outlet context={{ version, refresh, openNewJob: () => setNewJob(true) }} /></main>
      {newJob && (
        <JobFormModal onClose={() => setNewJob(false)}
          onSaved={() => { setNewJob(false); toast(t('ajobs.toastPosted')); refresh(); navigate('/admin/jobs'); }} />
      )}
    </Guard>
  );
}
