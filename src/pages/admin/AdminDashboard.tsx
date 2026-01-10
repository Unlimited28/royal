import React from 'react';
import { StatsGrid } from '../../components/ui/StatsGrid';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';

export const AdminDashboard: React.FC = () => {
    // Mock Stats Data
    const stats = [
        { label: 'Total Ambassadors', value: '1,245', icon: 'ri-group-line', change: '+12% from last month', trend: 'up' as const },
        { label: 'Pending Approvals', value: '23', icon: 'ri-user-follow-line', change: '5 urgent', trend: 'neutral' as const },
        { label: 'Exam Completions', value: '856', icon: 'ri-file-text-line', change: '+5% this week', trend: 'up' as const },
        { label: 'Total Revenue', value: '₦4.2M', icon: 'ri-bank-card-line', change: '+18% from last month', trend: 'up' as const },
    ];

    // Mock Recent Activity Data
    const recentActivity = [
        { id: 1, user: 'Samuel Adeboye', action: 'Passed Exam', detail: 'Junior Ambassador Promotion', time: '2 mins ago', status: 'success' },
        { id: 2, user: 'Pastor John Doe', action: 'Payment', detail: 'Association Dues - Ikeja', time: '15 mins ago', status: 'info' },
        { id: 3, user: 'New User', action: 'Registration', detail: 'Adebayo Kunle (Squire)', time: '1 hour ago', status: 'neutral' },
        { id: 4, user: 'System', action: 'Alert', detail: 'Cloud storage reaching capacity', time: '2 hours ago', status: 'warning' },
    ];

    const activityColumns = [
        { header: 'User', accessorKey: 'user' as const, className: 'text-white font-medium' },
        { header: 'Action', accessorKey: 'action' as const },
        { header: 'Detail', accessorKey: 'detail' as const },
        { header: 'Time', accessorKey: 'time' as const, className: 'text-slate-400' },
        {
            header: 'Status',
            cell: (item: typeof recentActivity[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'success' ? 'bg-green-500/10 text-green-500' :
                        item.status === 'info' ? 'bg-blue-500/10 text-blue-500' :
                            item.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-slate-500/10 text-slate-500'
                    }`}>
                    {item.status.toUpperCase()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-slate-400">Welcome back, Administrator. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <i className="ri-line-chart-line text-xl mr-2 text-accent" />
                            Recent Activity
                        </h3>
                        <button className="text-sm text-accent hover:text-white transition-colors">View All</button>
                    </div>

                    <DataTable
                        data={recentActivity}
                        columns={activityColumns}
                    />
                </Card>

                {/* Pending Tasks / Alerts */}
                <Card className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <i className="ri-error-warning-line text-xl mr-2 text-red-500" />
                            Pending Actions
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-primary/50 border border-navy-700 rounded-lg flex items-start space-x-4">
                            <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg">
                                <i className="ri-user-follow-line text-xl" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Verify New Presidents</h4>
                                <p className="text-sm text-slate-400 mt-1">3 new association presidents are awaiting verification.</p>
                                <button className="text-xs text-accent mt-2 hover:underline">Review Now</button>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/50 border border-navy-700 rounded-lg flex items-start space-x-4">
                            <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                                <i className="ri-bank-card-line text-xl" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Approve Camp Payments</h4>
                                <p className="text-sm text-slate-400 mt-1">12 bulk payments from associations need approval.</p>
                                <button className="text-xs text-accent mt-2 hover:underline">Review Now</button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
