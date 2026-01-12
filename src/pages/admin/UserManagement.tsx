import React, { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockUsers } from '../../utils/mockData';
import { type IUser } from '../../types';

const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Filter users based on search and role
    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            header: 'Name',
            cell: (user: IUser) => (
                <div>
                    <div className="font-medium text-white">{user.full_name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                </div>
            )
        },
        { header: 'Role', accessorKey: 'role' as const, className: 'capitalize' },
        { header: 'Association', accessorKey: 'association' as const },
        { header: 'Rank', accessorKey: 'rank' as const },
        {
            header: 'Status',
            cell: (user: IUser) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-500/10 text-green-500' :
                    user.status === 'inactive' ? 'bg-slate-500/10 text-slate-500' :
                        'bg-red-500/10 text-red-500'
                    }`}>
                    {user.status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <button className="p-1 hover:text-gold-500 transition-colors" title="Edit">
                        <i className="ri-pencil-line" />
                    </button>
                    <button className="p-1 hover:text-red-500 transition-colors" title="Delete">
                        <i className="ri-delete-bin-line" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-slate-400">Manage all ambassadors, presidents, and administrators.</p>
                </div>
                <Button>
                    <i className="ri-add-line mr-2" />
                    Add New User
                </Button>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex-1 max-w-md relative">
                        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-navy-900/50 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-gold-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <select
                                className="bg-navy-900/50 border border-navy-700 rounded-lg pl-4 pr-10 py-2 text-white appearance-none focus:outline-none focus:border-gold-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="ambassador">Ambassadors</option>
                                <option value="president">Presidents</option>
                                <option value="superadmin">Admins</option>
                            </select>
                            <i className="ri-filter-3-line absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <DataTable
                    data={filteredUsers}
                    columns={columns}
                    isLoading={false}
                />
            </Card>
        </div>
    );
};

export default UserManagement;
