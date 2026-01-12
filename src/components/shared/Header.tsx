import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      switch (user.role) {
        case 'ambassador':
          navigate('/dashboard');
          break;
        case 'president':
          navigate('/president/dashboard');
          break;
        case 'superadmin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div onClick={handleLogoClick} className="cursor-pointer">
          <img src="/logo.png" alt="Royal Ambassadors OGBC" className="h-12" />
        </div>
      </div>
    </header>
  );
};

export default Header;
