import React from 'react';
import { StatsGrid } from '../../components/ui/StatsGrid';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const PresidentDashboard: React.FC = () => {
    const stats = [
        { label: 'Total Members', value: '145', icon: 'ri-group-line', change: '+5 new', trend: 'up' as const },
        { label: 'Exam Applications', value: '12', icon: 'ri-file-text-line', change: 'Pending', trend: 'neutral' as const },
        { label: 'Payments', value: '₦125k', icon: 'ri-bank-card-line', change: 'This Month', trend: 'up' as const },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Association Overview</h1>
                <p className="text-slate-400">Manage your association members and approvals.</p>
            </div>

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">Pending Approvals</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800 flex justify-between items-center">
                            <div>
                                <div className="text-white font-medium">Exam Registration</div>
                                <div className="text-xs text-slate-500">5 members awaiting approval</div>
                            </div>
                            <Button size="sm" variant="outline">Review</Button>
                        </div>
                        <div className="p-4 bg-navy-900/50 rounded-lg border border-navy-800 flex justify-between items-center">
                            <div>
                                <div className="text-white font-medium">New Membership</div>
                                <div className="text-xs text-slate-500">3 new signups</div>
                            </div>
                            <Button size="sm" variant="outline">Review</Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/president/members" className="p-4 bg-navy-800 hover:bg-navy-700 rounded-lg text-center transition-colors group">
                            <i className="ri-group-line text-3xl mx-auto mb-2 text-gold-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white">Members</span>
                        </Link>
                        <Link to="/president/payments" className="p-4 bg-navy-800 hover:bg-navy-700 rounded-lg text-center transition-colors group">
                            <i className="ri-bank-card-line text-3xl mx-auto mb-2 text-gold-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white">Payments</span>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
export default PresidentDashboard;
