import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import HodDashboard from './pages/HodDashboard';
import StudentSummary from './pages/StudentSummary';

const readUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!localStorage.getItem('token') || !user?.role) { localStorage.removeItem('user'); localStorage.removeItem('token'); return null; }
    return user;
  }
  catch { localStorage.removeItem('user'); localStorage.removeItem('token'); return null; }
};

export default function App() {
  const [user, setUser] = useState(readUser);
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };

  return <BrowserRouter>
    <Toaster position="top-right" richColors closeButton />
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'TEACHER' ? '/teacher-dashboard' : '/hod-dashboard'} replace /> : <Login onLogin={setUser} />} />
      <Route path="/teacher-dashboard" element={user?.role === 'TEACHER' ? <TeacherDashboard user={user} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="/hod-dashboard" element={user?.role === 'HOD' ? <HodDashboard user={user} onLogout={logout} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={user ? (user.role === 'TEACHER' ? '/teacher-dashboard' : '/hod-dashboard') : '/'} replace />} />
      <Route
  path="/student-summary"
  element={
    user?.role === 'HOD'
      ? <StudentSummary />
      : <Navigate to="/" replace />
  } 
/>
    </Routes>
  </BrowserRouter>;
}
