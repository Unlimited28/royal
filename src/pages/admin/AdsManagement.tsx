import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useNavigate } from 'react-router-dom';

// Mock ads data
const mockAds = [
    {
        id: 1,
        title: 'Annual Camp 2024 Registration',
        placement: 'Homepage Banner',
        status: 'active' as const,
        impressions: 1250,
        clicks: 85,
        created_at: '2024-01-15'
    },
    {
        id: 2,
        title: 'Exam Registration Reminder',
        placement: 'Sidebar',
        status: 'active' as const,
        impressions: 890,
        clicks: 42,
        created_at: '2024-01-10'
    },
    {
        id: 3,
        title: 'Membership Dues Payment',
        placement: 'Footer',
        status: 'inactive' as const,
        impressions: 0,
        clicks: 0,
        created_at: '2024-01-05'
    }
];

const AdsManagement: React.FC = () => {
    const navigate = useNavigate();
    const columns = [
        {
            header: 'Ad Title',
            cell: (ad: typeof mockAds[0]) => (
                <div>
                    <div className="font-medium text-white">{ad.title}</div>
                    <div className="text-xs text-slate-400">{ad.placement}</div>
                </div>
            )
        },
        {
            header: 'Status',
            cell: (ad: typeof mockAds[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ad.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-slate-500/10 text-slate-500'
                    }`}>
                    {ad.status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Impressions',
            cell: (ad: typeof mockAds[0]) => (
                <span className="text-slate-300 font-mono">{ad.impressions.toLocaleString()}</span>
            )
        },
        {
            header: 'Clicks',
            cell: (ad: typeof mockAds[0]) => (
                <span className="text-gold-500 font-mono font-bold">{ad.clicks}</span>
            )
        },
        {
            header: 'CTR',
            cell: (ad: typeof mockAds[0]) => {
                const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
                return <span className="text-blue-500 font-mono">{ctr}%</span>;
            }
        },
        {
            header: 'Created',
            cell: (ad: typeof mockAds[0]) => (
                <span className="text-slate-300">
                    {new Date(ad.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (ad: typeof mockAds[0]) => (
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title={ad.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                        {ad.status === 'active' ? (
                            <i className="ri-eye-off-line text-yellow-500" />
                        ) : (
                            <i className="ri-eye-line text-green-500" />
                        )}
                    </button>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Edit Ad"
                    >
                        <i className="ri-pencil-line text-gold-500" />
                    </button>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Delete Ad"
                    >
                        <i className="ri-delete-bin-line text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Total Ads', value: mockAds.length, color: 'gold' },
        { label: 'Active', value: mockAds.filter(a => a.status === 'active').length, color: 'green' },
        { label: 'Total Impressions', value: mockAds.reduce((sum, a) => sum + a.impressions, 0).toLocaleString(), color: 'blue' },
        { label: 'Total Clicks', value: mockAds.reduce((sum, a) => sum + a.clicks, 0), color: 'purple' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Ads Management</h1>
                    <p className="text-slate-400">Manage advertisements and promotional content</p>
                </div>
                <Button onClick={() => navigate('/admin/ads/create')}>
                    <i className="ri-add-line mr-2" />
                    Create New Ad
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Ads Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">All Advertisements</h3>
                </div>

                <DataTable
                    data={mockAds}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default AdsManagement;
