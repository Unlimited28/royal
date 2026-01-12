import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const PublicNavbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Here you would typically clear tokens or user session
        console.log("User logged out");
        navigate('/');
    };

    const navLinks = [
        { title: 'Home', path: '/' },
        { title: 'About Us', path: '/about' },
        { title: 'Gallery', path: '/gallery' },
        { title: 'Blog Posts', path: '/blog' },
        { title: 'Media / Live', path: '/media' },
        { title: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="bg-navy-900/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-3">
                             <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-navy-600 h-10 w-10 flex items-center justify-center">
                                <img className="h-6 w-6 object-contain" src={logo} alt="Royal Ambassadors Logo" />
                            </div>
                            <span className="font-bold text-lg text-gold-500 hidden md:block">Royal Ambassadors</span>
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link key={link.title} to={link.path} className="text-slate-300 hover:text-gold-500 transition-colors duration-300 font-medium">
                                {link.title}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-2">
                        <button onClick={handleLogout} className="text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors">
                            Logout
                        </button>
                        <Link to="/register" className="bg-gold-500 text-navy-900 font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-all duration-300 shadow-lg shadow-gold-500/20">
                            Join as Ambassador
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-gold-500">
                            <i className="ri-menu-line text-2xl"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-navy-900 absolute top-full left-0 w-full z-40">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.title}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-300 hover:text-gold-500 block px-3 py-3 rounded-md text-base font-medium w-full text-center"
                            >
                                {link.title}
                            </Link>
                        ))}
                        <div className="border-t border-navy-700 w-4/5 my-4"></div>
                        <div className="pt-4 pb-3 w-full px-4 space-y-3">
                             <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-2.5 rounded-lg border border-gold-500 text-gold-500 font-bold bg-transparent hover:bg-gold-500 hover:text-navy-900">
                                Access Portal
                            </Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-2.5 rounded-lg bg-gold-500 text-navy-900 font-bold hover:bg-gold-600">
                                Join as Ambassador
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="block w-full text-center px-4 py-2 rounded-lg text-slate-400 mt-4"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default PublicNavbar;
