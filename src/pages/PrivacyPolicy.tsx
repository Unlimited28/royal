import React from 'react';
import { PublicNavbar } from '../components/layout/PublicNavbar';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary text-white">
      <PublicNavbar />
      <div className="max-w-2xl mx-auto text-center p-8 pt-24">
        <h1 className="text-4xl font-bold mb-4 text-accent">Privacy Policy</h1>
        <p className="text-slate-300">
          This page is a placeholder for the Privacy Policy. The full text will be added here.
        </p>
      </div>
    </div>
  );
};
