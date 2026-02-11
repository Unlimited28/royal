import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const FinanceDashboard: React.FC = () => {
    const [statsData, setStatsData] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, paymentsRes] = await Promise.all([
                    api.get('/dashboard/finance/stats'),
                    api.get('/dashboard/finance/payments'),
                ]);
                setStatsData(statsRes.data);
                setPayments(paymentsRes.data);
            } catch (error) {
                console.error('Failed to fetch finance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const approvedStats = statsData?.find((s: any) => s._id === 'approved');
    const pendingStats = statsData?.find((s: any) => s._id === 'pending');
    const rejectedStats = statsData?.find((s: any) => s._id === 'rejected');

    const totalRevenue = approvedStats?.totalAmount || 0;
    const pendingAmount = pendingStats?.totalAmount || 0;

    const stats = [
        {
            label: 'Total Revenue',
            value: `₦${totalRevenue.toLocaleString()}`,
            icon: 'ri-scales-3-line',
            change: 'Approved payments',
            trend: 'up' as const,
            color: 'green'
        },
        {
            label: 'Pending Amount',
            value: `₦${pendingAmount.toLocaleString()}`,
            icon: 'ri-time-line',
            change: 'Awaiting approval',
            trend: 'neutral' as const,
            color: 'blue'
        },
        {
            label: 'Rejected Count',
            value: rejectedStats?.count?.toString() || '0',
            icon: 'ri-arrow-left-down-line',
            change: 'Payment issues',
            trend: 'down' as const,
            color: 'red'
        },
        {
            label: 'Transactions',
            value: payments.length.toString(),
            icon: 'ri-line-chart-line',
            change: 'Total records',
            trend: 'neutral' as const,
            color: 'gold'
        }
    ];

    if (loading) return <div className="text-white">Loading finance stats...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Finance Dashboard</h1>
                <p className="text-slate-400">Overview of financial performance and transactions</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center`}>
                                <i className={`${stat.icon} text-2xl text-${stat.color}-500`} />
                            </div>
                            {stat.trend === 'up' && <i className="ri-arrow-right-up-line text-green-500" />}
                            {stat.trend === 'down' && <i className="ri-arrow-right-down-line text-red-500" />}
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.change}</p>
                    </Card>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {payments.slice(0, 5).map((payment) => (
                            <div
                                key={payment._id}
                                className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-800"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.status === 'approved'
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        <i className="ri-bank-card-line" />
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{payment.type}</div>
                                        <div className="text-xs text-slate-400">{payment.referenceNote || 'No reference'}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${payment.status === 'approved' ? 'text-green-500' : 'text-white'}`}>
                                        ₦{payment.amount.toLocaleString()}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'approved'
                                            ? 'bg-green-500/10 text-green-500'
                                            : payment.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {payment.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Revenue Breakdown */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Revenue Breakdown</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Exam Fees</span>
                                <span className="text-white font-bold">₦1.2M</span>
                            </div>
                            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-gold-500 to-yellow-500 w-[35%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Camp Registration</span>
                                <span className="text-white font-bold">₦1.8M</span>
                            </div>
                            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[50%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Membership Dues</span>
                                <span className="text-white font-bold">₦800K</span>
                            </div>
                            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[25%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Other Income</span>
                                <span className="text-white font-bold">₦400K</span>
                            </div>
                            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[15%]"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default FinanceDashboard;
