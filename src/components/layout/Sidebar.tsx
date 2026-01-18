import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';


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
    Notification: 'ri-notification-line',
    Support: 'ri-customer-service-line',
};


export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const { user, logout } = useAuth();

    const getHomePath = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'ambassador':
                return '/dashboard';
            case 'president':
                return '/president/dashboard';
            case 'admin':
            case 'superadmin':
                return '/admin/dashboard';
            default:
                return '/';
        }
    };
    const ambassadorLinks = [
        { name: 'Dashboard', icon: iconMap.LayoutDashboard, path: '/dashboard' },
        { name: 'My Exams', icon: iconMap.FileText, path: '/ambassador/exams' },
        { name: 'Results', icon: iconMap.Award, path: '/ambassador/results' },
        { name: 'Blog', icon: iconMap.FileText, path: '/ambassador/blog' },
        { name: 'Gallery', icon: iconMap.Image, path: '/ambassador/gallery' },
        { name: 'Live & Media', icon: iconMap.Live, path: '/ambassador/media' },
        { name: 'Profile', icon: iconMap.Users, path: '/ambassador/profile' },
        { name: 'Notifications', icon: iconMap.Notification, path: '/ambassador/notifications' },
        { name: 'Support', icon: iconMap.Support, path: '/ambassador/support' },
    ];


    const superAdminLinks = [
        { name: 'Dashboard', icon: iconMap.LayoutDashboard, path: '/admin/dashboard' },
        { name: 'User Management', icon: iconMap.Users, path: '/admin/users' },
        { name: 'Associations', icon: iconMap.Users, path: '/admin/associations' },
        { name: 'Exam Management', icon: iconMap.FileText, path: '/admin/exams' },
        { name: 'Finance', icon: iconMap.CreditCard, path: '/admin/finance' },
        { name: 'Payment Verification', icon: iconMap.CreditCard, path: '/admin/payments' },
        { name: 'Receipts', icon: iconMap.FileText, path: '/admin/receipts' },
        { name: 'Blog Management', icon: iconMap.FileText, path: '/admin/blog' },
        { name: 'Gallery Management', icon: iconMap.Image, path: '/admin/gallery' },
        { name: 'Media Management', icon: iconMap.Live, path: '/admin/media' },
        { name: 'Ads Management', icon: iconMap.CreditCard, path: '/admin/ads' },
        { name: 'Blog View', icon: iconMap.FileText, path: '/admin/blog-view' },
        { name: 'Gallery View', icon: iconMap.Image, path: '/admin/gallery-view' },
        { name: 'Media View', icon: iconMap.Live, path: '/admin/media-view' },
        { name: 'System Settings', icon: iconMap.Settings, path: '/admin/settings' },
        { name: 'Audit Logs', icon: iconMap.FileText, path: '/admin/audit' },
    ];




    const presidentLinks = [
        { name: 'Dashboard', icon: iconMap.LayoutDashboard, path: '/president/dashboard' },
        { name: 'Members', icon: iconMap.Users, path: '/president/members' },
        { name: 'Approvals', icon: iconMap.FileText, path: '/president/approvals' },
        { name: 'Payments', icon: iconMap.CreditCard, path: '/president/payments' },
        { name: 'Camp Reg', icon: iconMap.Users, path: '/president/camp-registrations' },
        { name: 'Blog', icon: iconMap.FileText, path: '/president/blog' },
        { name: 'Gallery', icon: iconMap.Image, path: '/president/gallery' },
        { name: 'Live & Media', icon: iconMap.Live, path: '/president/media' },
        { name: 'Notifications', icon: iconMap.Notification, path: '/president/notifications' },
    ];


    const links = [
        ...(role === 'ambassador' ? ambassadorLinks : []),
        ...(role === 'superadmin' || role === 'admin' ? superAdminLinks : []),
        ...(role === 'president' ? presidentLinks : []),
    ];


    return (
        <aside className="w-64 bg-navy-900 border-r border-navy-800 flex-shrink-0 relative z-20 hidden md:flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-navy-800">
                <Link to={getHomePath()} className="flex items-center space-x-3">
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
                                ? "bg-navy-800 text-gold-500 border-l-4 border-gold-500 shadow-md"
                                : "text-slate-400 hover:bg-navy-800/50 hover:text-white"
                        )}
                    >
                        <i className={`${link.icon} w-5 h-5 mr-3`} />
                        <span className="font-medium">{link.name}</span>
                    </NavLink>
                ))}
            </nav>


            <div className="p-4 border-t border-navy-800">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-navy-800 rounded-lg transition-colors"
                >
                    <i className={`${iconMap.LogOut} w-5 h-5 mr-3`} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};
