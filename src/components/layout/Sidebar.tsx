import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';


interface SidebarProps {
    role?: 'ambassador' | 'admin' | 'superadmin' | 'president';
}


const iconMap = {
    LayoutDashboard: 'ri-dashboard-line',
    Users: 'ri-group-line',
    FileText: 'ri-file-text-line',
    CreditCard: 'ri-bank-card-line',
    Award: 'ri-award-line',
    Image: 'ri-image-line',
    Settings: 'ri-settings-3-line',
    LogOut: 'ri-logout-box-r-line',
    Live: 'ri-live-line',
};


export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const commonLinks = [
        { name: 'Dashboard', icon: iconMap.LayoutDashboard, path: '/dashboard' },
    ];


    const ambassadorLinks = [
        { name: 'My Exams', icon: iconMap.FileText, path: '/ambassador/exams' },
        { name: 'Results', icon: iconMap.Award, path: '/ambassador/results' },
        { name: 'Gallery', icon: iconMap.Image, path: '/gallery' },
        { name: 'Live & Media', icon: iconMap.Live, path: '/media' },
    ];


    const adminLinks = [
        { name: 'Ambassadors', icon: iconMap.Users, path: '/admin/ambassadors' },
        { name: 'Approvals', icon: iconMap.FileText, path: '/admin/approvals' },
        { name: 'Payments', icon: iconMap.CreditCard, path: '/admin/payments' },
        { name: 'Camp Reg', icon: iconMap.Users, path: '/admin/camp-registration' },
    ];


    const superAdminLinks = [
        { name: 'Manage Users', icon: iconMap.Users, path: '/super/users' },
        { name: 'Exams', icon: iconMap.FileText, path: '/super/exams' },
        { name: 'Finance', icon: iconMap.CreditCard, path: '/super/finance' },
        { name: 'Settings', icon: iconMap.Settings, path: '/super/settings' },
    ];




    const presidentLinks = [
        { name: 'Members', icon: iconMap.Users, path: '/president/members' },
        { name: 'Approvals', icon: iconMap.FileText, path: '/president/approvals' },
        { name: 'Payments', icon: iconMap.CreditCard, path: '/president/payments' },
    ];


    const links = [
        ...commonLinks,
        ...(role === 'ambassador' ? ambassadorLinks : []),
        ...(role === 'admin' ? adminLinks : []),
        ...(role === 'superadmin' ? superAdminLinks : []),
        ...(role === 'president' ? presidentLinks : []),
    ];


    return (
        <aside className="w-64 bg-primary border-r border-primary-dark flex-shrink-0 relative z-20 hidden md:flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-primary-dark">
                <Link to="/" className="flex items-center space-x-3">
                    <img
                        src={logo}
                        alt="Royal Ambassadors"
                        className="h-8 w-auto"
                    />
                    <span className="font-bold text-xl text-white">RA Portal</span>
                </Link>
            </div>


            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => cn(
                            "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group",
                            isActive
                                ? "bg-primary-dark text-accent border-l-4 border-accent shadow-md"
                                : "text-slate-400 hover:bg-primary-dark/50 hover:text-white"
                        )}
                    >
                        <i className={`${link.icon} w-5 h-5 mr-3`} />
                        <span className="font-medium">{link.name}</span>
                    </NavLink>
                ))}
            </nav>


            <div className="p-4 border-t border-primary-dark">
                <button className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-primary-dark rounded-lg transition-colors">
                    <i className={`${iconMap.LogOut} w-5 h-5 mr-3`} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
