import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Navbar from './Navbar';

interface DashboardLayoutProps {
    children?: React.ReactNode;
    role?: 'ambassador' | 'admin' | 'superadmin' | 'president';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role = 'ambassador' }) => {

    return (
        <div className="flex h-screen bg-transparent overflow-hidden">
            {/* Sidebar - Desktop */}
            <Sidebar role={role} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-6 relative z-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay would go here (simplified for now) */}
        </div>
    );
};
