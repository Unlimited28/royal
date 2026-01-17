import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockCampRegistrations } from '../../utils/mockData';

export const CampRegistrations: React.FC = () => {
    const columns = [
        {
            header: 'Ambassador',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <div>
                    <div className="font-medium text-white">{reg.ambassador_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{reg.ambassador_code}</div>
                </div>
            )
        },
        {
            header: 'Camp Type',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {reg.camp_type}
                </span>
            )
        },
        {
            header: 'Registration Date',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <div className="flex items-center space-x-2 text-slate-300">
                    <i className="ri-calendar-line" />
                    <span>
                        {reg.registration_date ? new Date(reg.registration_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Payment Status',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.payment_status === 'paid'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {reg.payment_status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Amount',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className="text-gold-500 font-bold">₦{(reg.amount || 0).toLocaleString()}</span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            )
        }
    ];

    const totalRegistrations = mockCampRegistrations.length;
    const paidCount = mockCampRegistrations.filter(r => r.payment_status === 'paid').length;
    const pendingCount = mockCampRegistrations.filter(r => r.payment_status === 'pending').length;
    const totalRevenue = mockCampRegistrations
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

    const stats = [
        { label: 'Total Registrations', value: totalRegistrations, color: 'gold', icon: 'ri-group-line' },
        { label: 'Paid', value: paidCount, color: 'green', icon: 'ri-checkbox-circle-line' },
        { label: 'Pending Payment', value: pendingCount, color: 'yellow', icon: 'ri-time-line' },
        { label: 'Total Revenue', value: `₦${(totalRevenue / 1000).toFixed(0)}K`, color: 'blue', icon: 'ri-bank-card-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Camp Registrations</h1>
                    <p className="text-slate-400">Manage camp registrations for your association</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline">
                        <i className="ri-file-excel-line mr-2" />
                        Bulk Excel Upload
                    </Button>
                    <Button>
                        <i className="ri-bank-card-line mr-2" />
                        Initiate Bulk Payment
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <i className={`${stat.icon} text-xl text-${stat.color}-500`} />
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Registrations Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-group-line mr-2 text-gold-500" />
                        All Registrations
                    </h3>
                </div>

                <DataTable
                    data={mockCampRegistrations}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default CampRegistrations;
