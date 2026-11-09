import { Navigate, Route, Routes } from 'react-router-dom';
import { CandidateLayout, EmployerLayout } from './components/Layouts';
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AdminJobs from './pages/AdminJobs';
import AdminApplications from './pages/AdminApplications';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login role="CANDIDATE" />} />
      <Route path="/login/employer" element={<Login role="EMPLOYER" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />

      <Route element={<CandidateLayout />}>
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<EmployerLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
