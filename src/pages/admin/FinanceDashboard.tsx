import React from 'react';
import { Card } from '../../components/ui/Card';
import { mockFinancialSummary, mockTransactions } from '../../utils/mockData';

export const FinanceDashboard: React.FC = () => {
    const summary = mockFinancialSummary;
    const netIncome = summary.total_revenue - summary.total_expenses;
    const monthlyGrowth = ((summary.this_month_revenue - summary.last_month_revenue) / summary.last_month_revenue) * 100;

    const stats = [
        {
            label: 'Total Revenue',
            value: `₦${(summary.total_revenue / 1000000).toFixed(1)}M`,
            icon: 'ri-scales-3-line',
            change: '+18% from last month',
            trend: 'up' as const,
            color: 'green'
        },
        {
            label: 'Total Expenses',
            value: `₦${(summary.total_expenses / 1000000).toFixed(1)}M`,
            icon: 'ri-arrow-left-down-line',
            change: '+5% from last month',
            trend: 'neutral' as const,
            color: 'red'
        },
        {
            label: 'Net Income',
            value: `₦${(netIncome / 1000000).toFixed(1)}M`,
            icon: 'ri-line-chart-line',
            change: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
            trend: monthlyGrowth > 0 ? 'up' as const : 'down' as const,
            color: 'gold'
        },
        {
            label: 'Pending Payments',
            value: `₦${(summary.pending_payments / 1000).toFixed(0)}K`,
            icon: 'ri-time-line',
            change: 'Awaiting approval',
            trend: 'neutral' as const,
            color: 'blue'
        }
    ];

    const recentTransactions = mockTransactions.slice(0, 5);

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
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 bg-primary/50 rounded-lg border border-primary-dark"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income'
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-red-500/20 text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? (
                                            <i className="ri-arrow-up-line" />
                                        ) : (
                                            <i className="ri-arrow-down-line" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{transaction.category}</div>
                                        <div className="text-xs text-slate-400">{transaction.description}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${transaction.status === 'completed'
                                            ? 'bg-green-500/10 text-green-500'
                                            : transaction.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {transaction.status}
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
                        <div className="p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Exam Fees</span>
                                <span className="text-white font-bold">₦1.2M</span>
                            </div>
                            <div className="h-2 bg-primary-dark rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-accent to-yellow-500 w-[35%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Camp Registration</span>
                                <span className="text-white font-bold">₦1.8M</span>
                            </div>
                            <div className="h-2 bg-primary-dark rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[50%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Membership Dues</span>
                                <span className="text-white font-bold">₦800K</span>
                            </div>
                            <div className="h-2 bg-primary-dark rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[25%]"></div>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Other Income</span>
                                <span className="text-white font-bold">₦400K</span>
                            </div>
                            <div className="h-2 bg-primary-dark rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[15%]"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
