import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-[#FFFFFF] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-[#0F172A]">
                College Marks System
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-[#1E40AF] ${
                  location.pathname === '/' ? 'text-[#1E3A8A]' : 'text-[#64748B]'
                }`}
              >
                HOD Dashboard
              </Link>
              <Link
                to="/teacher"
                className={`text-sm font-medium transition-colors hover:text-[#1E40AF] ${
                  location.pathname === '/teacher' ? 'text-[#1E3A8A]' : 'text-[#64748B]'
                }`}
              >
                Teacher Dashboard
              </Link>
              <Link
                to="/student-summary"
                className={`text-sm font-medium transition-colors hover:text-[#1E40AF] ${
                  location.pathname === '/student-summary' ? 'text-[#1E3A8A]' : 'text-[#64748B]'
                }`}
              >
                Student Summary
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
