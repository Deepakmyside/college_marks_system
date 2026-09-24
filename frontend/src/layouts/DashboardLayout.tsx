import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">
                College Marks System
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                HOD Dashboard
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
