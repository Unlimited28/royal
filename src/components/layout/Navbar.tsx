import React from 'react';


interface NavbarProps {
    onMenuClick?: () => void;
    user?: {
        name: string;
        role: string;
        avatar?: string;
    };
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, user = { name: 'Guest User', role: 'Ambassador' } }) => {
    return (
        <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-navy-800 sticky top-0 z-30 px-6 flex items-center justify-between">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg mr-2 transition-colors"
                >
                    <i className="ri-menu-line text-xl" />
                </button>

                {/* Logo */}
                <div className="flex items-center">
                     <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-navy-600 h-10 w-10 flex items-center justify-center">
                        <img className="h-6 w-6 object-contain" src="/images/logo-gold.png" alt="Royal Ambassadors Logo" />
                    </div>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center relative ml-6">
                    <i className="ri-search-line text-slate-500 absolute left-3" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-navy-800/50 border border-navy-700 text-sm rounded-full pl-10 pr-4 py-2 text-slate-300 focus:outline-none focus:border-gold-500/50 w-64 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-slate-400 hover:text-gold-500 relative transition-colors">
                    <i className="ri-notification-3-line text-xl" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-navy-900"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 pl-4 border-l border-navy-800">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gold-500 capitalize">{user.role}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-navy-700 border-2 border-gold-500/30 flex items-center justify-center overflow-hidden">
                        {/* Use placeholder if no avatar */}
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-lg font-bold text-gold-500">{user.name.charAt(0)}</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
