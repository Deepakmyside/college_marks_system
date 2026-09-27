import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HodDashboard from './pages/HodDashboard';
import StudentSummary from './pages/StudentSummary';
import TeacherDashboard from './pages/TeacherDashboard';
function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<HodDashboard />} />
          <Route path="/student-summary" element={<StudentSummary />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
