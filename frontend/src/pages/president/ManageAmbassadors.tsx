import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const ManageAmbassadors: React.FC = () => {
    const { user: currentPresident } = useAuth();
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmbassadors = async () => {
            try {
                const response = await api.get('/dashboard/president/users');
                setAmbassadors(response.data.map((u: any) => ({ ...u, id: u._id })));
            } catch (error) {
                console.error('Failed to fetch ambassadors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbassadors();
    }, []);

    if (!currentPresident || loading) {
        return <div className="text-white p-8 text-center">Loading members...</div>;
    }

    const columns = [
        {
            header: 'Ambassador',
            cell: (user: any) => (
                <div>
                    <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                </div>
            )
        },
        {
            header: 'Code',
            cell: (user: any) => (
                <span className="font-mono text-gold-500">{user.userCode}</span>
            )
        },
        {
            header: 'Rank',
            cell: (user: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                    {user.rank}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (user: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                    }`}>
                    {user.status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Joined',
            cell: (user: any) => (
                <span className="text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        View Profile
                    </Button>
                    {/* Placeholder for Approve action logic - to be connected to backend */}
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Total Ambassadors', value: ambassadors.length, color: 'gold', icon: 'ri-group-line' },
        { label: 'Active', value: ambassadors.filter(a => a.status === 'active').length, color: 'green', icon: 'ri-user-follow-line' },
        { label: 'Inactive', value: ambassadors.filter(a => a.status === 'inactive').length, color: 'red', icon: 'ri-user-unfollow-line' },
        { label: 'This Month', value: 0, color: 'blue', icon: 'ri-shield-user-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Manage Ambassadors</h1>
                <p className="text-slate-400">View and manage ambassadors in your association</p>
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

            {/* Ambassadors Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-group-line mr-2 text-gold-500" />
                        Association Members
                    </h3>
                </div>

                <DataTable
                    data={ambassadors}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default ManageAmbassadors;
