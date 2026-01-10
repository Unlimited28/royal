import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockUsers } from '../../utils/mockData';

export const ManageAmbassadors: React.FC = () => {
    // Simulate President Logged In
    const currentPresident = mockUsers[1]; // Pastor Emmanuel Adebayo (Assoc: Ikeja Association)

    // Filter for ambassadors ONLY in this president's association
    const ambassadors = mockUsers.filter(u =>
        u.role === 'ambassador' &&
        u.association === currentPresident.association
    );

    const columns = [
        {
            header: 'Ambassador',
            cell: (user: typeof mockUsers[0]) => (
                <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                </div>
            )
        },
        {
            header: 'Code',
            cell: (user: typeof mockUsers[0]) => (
                <span className="font-mono text-accent">{user.ambassador_code}</span>
            )
        },
        {
            header: 'Rank',
            cell: (user: typeof mockUsers[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {user.rank}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (user: typeof mockUsers[0]) => (
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
            cell: (user: typeof mockUsers[0]) => (
                <span className="text-slate-300">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
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
        { label: 'This Month', value: 0, color: 'blue', icon: 'ri-shield-user-line' } // Reset mock stat
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Manage Ambassadors</h1>
                <p className="text-slate-400">View and manage ambassadors in <span className="text-accent">{currentPresident.association}</span></p>
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
                        <i className="ri-group-line mr-2 text-accent" />
                        Association Members
                    </h3>
                </div>

                <DataTable
                    data={ambassadors}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
