import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from '../components/shared/Header';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <nav className="bg-primary-dark shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4 py-2">
            <NavLink to="/" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>About</NavLink>
            <NavLink to="/blog" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Blog</NavLink>
            <NavLink to="/gallery" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Gallery</NavLink>
            <NavLink to="/media" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Media/Live</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Contact</NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Login</NavLink>
            <NavLink to="/register" className={({ isActive }) => isActive ? "text-accent" : "text-light"}>Register</NavLink>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
