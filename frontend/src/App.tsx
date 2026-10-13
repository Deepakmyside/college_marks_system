import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import HodDashboard from './pages/HodDashboard';

const App = () => {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    // Check for user authentication here (e.g., from cookies or local storage)
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'TEACHER' ? '/teacher-dashboard' : '/hod-dashboard'} /> : <Login />} />
        <Route path="/teacher-dashboard" element={user?.role === 'TEACHER' ? <TeacherDashboard /> : <Navigate to="/" />} />
        <Route path="/hod-dashboard" element={user?.role === 'HOD' ? <HodDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;