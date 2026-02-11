import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                // Map _id to id for DataTable
                const mappedUsers = response.data.map((u: any) => ({ ...u, id: u._id }));
                setUsers(mappedUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users based on search and role
    const filteredUsers = users.filter(user => {
        const name = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.roles?.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            header: 'Name',
            cell: (user: any) => (
                <div>
                    <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
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
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default UserManagement;
