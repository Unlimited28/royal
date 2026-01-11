import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../components/shared/Header';
import { useAuth } from '../context/AuthContext';

const AmbassadorLayout: React.FC = () => {
    const { logout } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-primary text-light flex flex-col">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Ambassador Portal</h2>
        </div>
        <nav className="flex-grow p-4">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Dashboard</NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Profile</NavLink>
            <NavLink to="/exams" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Exams</NavLink>
            <NavLink to="/exam-history" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Exam History</NavLink>
            <NavLink to="/ambassador/media" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Media/Live</NavLink>
            <NavLink to="/ambassador/gallery" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Gallery</NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Notifications</NavLink>
            <NavLink to="/support" className={({ isActive }) => isActive ? "block py-2 px-4 text-accent" : "block py-2 px-4"}>Support</NavLink>
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

export default AmbassadorLayout;
