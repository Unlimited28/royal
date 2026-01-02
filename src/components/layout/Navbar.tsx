
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-navy-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-bold">Royal Ambassadors</span>
        </Link>
        <div>
          {user ? (
            <button onClick={logout} className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-4 rounded">
              Logout
            </button>
          ) : (
            <Link to="/login" className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-2 px-4 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
