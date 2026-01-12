import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <PublicNavbar />
      <main><Outlet /></main>
    </div>
  );
};

export default PublicLayout;