import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog Posts', path: '/blog' },
    { name: 'Media / Live', path: '/media' },
    { name: 'Contact', path: '/contact' },
];

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };


    return (
        <>
            <header className="h-20 px-6 flex items-center justify-between sticky top-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-navy-800">
                <Link to="/" className="flex items-center space-x-3">
                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-navy-600 h-10 w-10 flex items-center justify-center object-contain">
                        <img
                            src={logo}
                            alt="Royal Ambassadors Logo"
                            className="h-full w-full"
                        />
                    </div>
                     <div className="hidden md:block">
                        <h1 className="text-xl font-bold text-white leading-none">Royal Ambassadors</h1>
                        <span className="text-xs text-gold-500 font-medium tracking-wider">OGUN BAPTIST CONFERENCE</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-4">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                             className={({ isActive }) =>
                                cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive ? "text-gold-500" : "text-slate-300 hover:text-white hover:bg-navy-800/50"
                                )
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                     <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-navy-800/50">
                        Logout
                    </button>
                </nav>

                 {/* Mobile Nav Toggler */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2 rounded-md hover:bg-navy-800/50">
                        <i className="ri-menu-line text-2xl"></i>
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={cn(
                "md:hidden fixed top-20 left-0 w-full h-[calc(100vh-5rem)] bg-navy-900 z-40 p-6 transform transition-transform duration-300 ease-in-out",
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                                    isActive ? "bg-navy-800 text-gold-500" : "text-slate-300 hover:bg-navy-800/50 hover:text-white"
                                )
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                        <div className="pt-6 border-t border-navy-700 space-y-4">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900">Login</Button>
                        </Link>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold">Join as Ambassador</Button>
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-navy-800/50 transition-colors">
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};
