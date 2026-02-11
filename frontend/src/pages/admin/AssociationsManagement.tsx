import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';

export const AssociationsManagement: React.FC = () => {
    const [associations, setAssociations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssociations = async () => {
            try {
                const response = await api.get('/associations');
                setAssociations(response.data.map((a: any) => ({ ...a, id: a._id })));
            } catch (error) {
                console.error('Failed to fetch associations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssociations();
    }, []);

    const columns = [
        {
            header: 'Association',
            cell: (assoc: any) => (
                <div>
                    <div className="font-medium text-white">{assoc.name}</div>
                    <div className="text-xs text-slate-400">CODE: {assoc.code}</div>
                </div>
            )
        },
        {
            header: 'President',
            cell: (assoc: any) => (
                <span className="text-slate-300">
                    {assoc.president ? `${assoc.president.firstName} ${assoc.president.lastName}` : 'Not Assigned'}
                </span>
            )
        },
        {
            header: 'Members',
            cell: (assoc: typeof associations[0]) => (
                <span className="text-gold-500 font-semibold">{assoc.members}</span>
            )
        },
        {
            header: 'Status',
            cell: (assoc: typeof associations[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assoc.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                }`}>
                    {assoc.status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View</Button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Associations Management</h1>
                    <p className="text-slate-400">Manage all associations across the conference</p>
                </div>
                <Button>Add New Association</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Total Associations</p>
                    <p className="text-2xl font-bold text-white">4</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Active Associations</p>
                    <p className="text-2xl font-bold text-green-500">3</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Total Members</p>
                    <p className="text-2xl font-bold text-gold-500">164</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Avg Members/Assoc</p>
                    <p className="text-2xl font-bold text-blue-500">41</p>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">All Associations</h3>
                </div>
                <DataTable
                    data={associations}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default AssociationsManagement;