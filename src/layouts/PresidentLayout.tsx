import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../components/shared/Header';
import { useAuth } from '../context/AuthContext';

const PresidentLayout: React.FC = () => {
    const { logout } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-light flex flex-col">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">President Portal</h2>
        </div>
        <nav className="flex-grow p-4">
            <NavLink to="/president/dashboard" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Dashboard</NavLink>
            <NavLink to="/president/members" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Members Management</NavLink>
            <NavLink to="/president/exam-approval" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Exam Approval</NavLink>
            <NavLink to="/president/camp-registration" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Camp Registration</NavLink>
            <NavLink to="/president/payments" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Payment Tracking</NavLink>
            <NavLink to="/president/notifications" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Notifications</NavLink>
            <NavLink to="/president/media" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Media/Live</NavLink>
            <NavLink to="/president/gallery" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Gallery</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <button onClick={logout} className="w-full bg-accent text-primary py-2 px-4 rounded">Logout</button>
        </div>
      </aside>
      <div className="flex-grow flex flex-col">
        <Header />
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PresidentLayout;
