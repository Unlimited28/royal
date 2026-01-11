import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../components/shared/Header';
import { useAuth } from '../context/AuthContext';

const SuperAdminLayout: React.FC = () => {
    const { logout } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-light flex flex-col">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Super Admin Portal</h2>
        </div>
        <nav className="flex-grow p-4">
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Global Dashboard</NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>User Management</NavLink>
            <NavLink to="/admin/associations" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Associations</NavLink>
            <NavLink to="/admin/exams" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Exams</NavLink>
            <NavLink to="/admin/finance" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Finance</NavLink>
            <NavLink to="/admin/payments" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Payment Verification</NavLink>
            <NavLink to="/admin/receipts" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Receipts</NavLink>
            <NavLink to="/admin/blog" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Blog & Gallery</NavLink>
            <NavLink to="/admin/media" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Media/Live</NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Settings</NavLink>
            <NavLink to="/admin/logs" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Audit Logs</NavLink>
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

export default SuperAdminLayout;
