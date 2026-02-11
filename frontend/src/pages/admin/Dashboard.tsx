import React, { useEffect, useState } from 'react';
import { StatsGrid } from '../../components/ui/StatsGrid';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const AdminDashboard: React.FC = () => {
    const [statsData, setStatsData] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    api.get('/dashboard/superadmin/stats'),
                    api.get('/dashboard/superadmin/audit-logs'),
                ]);
                setStatsData(statsRes.data);
                setAuditLogs(logsRes.data);
            } catch (error) {
                console.error('Failed to fetch admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pendingPayments = statsData?.payments?.find((p: any) => p._id === 'pending')?.count || 0;
    const totalRevenue = statsData?.payments?.find((p: any) => p._id === 'approved')?.totalAmount || 0;

    const stats = [
        { label: 'Total Users', value: statsData?.totalUsers?.toLocaleString() || '0', icon: 'ri-group-line', trend: 'neutral' as const },
        { label: 'Pending Payments', value: pendingPayments.toString(), icon: 'ri-user-follow-line', trend: 'neutral' as const },
        { label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: 'ri-bank-card-line', trend: 'up' as const },
        { label: 'Active Ads', value: statsData?.activeAdsCount?.toString() || '0', icon: 'ri-advertisement-line', trend: 'neutral' as const },
    ];

    const recentActivity = auditLogs.slice(0, 5).map(log => ({
        id: log._id,
        user: log.actorRole,
        action: log.action,
        detail: log.targetType,
        time: new Date(log.createdAt).toLocaleString(),
        status: 'info'
    }));

    const activityColumns = [
        { header: 'User', accessorKey: 'user' as const, className: 'text-white font-medium' },
        { header: 'Action', accessorKey: 'action' as const },
        { header: 'Detail', accessorKey: 'detail' as const },
        { header: 'Time', accessorKey: 'time' as const, className: 'text-slate-400' },
        {
            header: 'Status',
            cell: (item: any) => (
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

    if (loading) return <div className="text-white">Loading admin dashboard...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-navy-800 to-navy-900 p-8 rounded-2xl border border-gold-500/10 shadow-xl mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Super Admin</h1>
                <p className="text-gold-500 font-medium tracking-wide italic">System Overview & Administrative Control</p>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">System Stats</h2>
                <StatsGrid stats={stats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <i className="ri-line-chart-line text-xl mr-2 text-gold-500" />
                            Recent Activity
                        </h3>
                        <button className="text-sm text-gold-500 hover:text-white transition-colors">View All</button>
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
                        <div className="p-4 bg-navy-900/50 border border-navy-700 rounded-lg flex items-start space-x-4">
                            <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg">
                                <i className="ri-user-follow-line text-xl" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Verify New Presidents</h4>
                                <p className="text-sm text-slate-400 mt-1">{statsData?.pendingPresidentsCount || 0} new association presidents are awaiting verification.</p>
                                <button className="text-xs text-gold-500 mt-2 hover:underline">Review Now</button>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-900/50 border border-navy-700 rounded-lg flex items-start space-x-4">
                            <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                                <i className="ri-bank-card-line text-xl" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Approve Pending Payments</h4>
                                <p className="text-sm text-slate-400 mt-1">{pendingPayments} payments need approval.</p>
                                <button className="text-xs text-gold-500 mt-2 hover:underline">Review Now</button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
