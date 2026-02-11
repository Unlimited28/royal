import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';

export const AuditLogs: React.FC = () => {
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/dashboard/superadmin/audit-logs');
                setAuditLogs(response.data.map((l: any) => ({ ...l, id: l._id })));
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const columns = [
        {
            header: 'User',
            cell: (log: any) => (
                <div>
                    <div className="font-medium text-white">{log.actorRole}</div>
                    <div className="text-xs text-slate-400">{log.ipAddress || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Action',
            cell: (log: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {log.action}
                </span>
            )
        },
        {
            header: 'Details',
            cell: (log: any) => (
                <span className="text-slate-300">{log.targetType} ({log.targetId})</span>
            )
        },
        {
            header: 'Timestamp',
            cell: (log: any) => (
                <span className="text-slate-300 text-sm">{new Date(log.createdAt).toLocaleString()}</span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                <p className="text-slate-400">System activity and security logs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Total Logs Today</p>
                    <p className="text-2xl font-bold text-white">24</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Login Attempts</p>
                    <p className="text-2xl font-bold text-green-500">18</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Failed Logins</p>
                    <p className="text-2xl font-bold text-red-500">2</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">System Events</p>
                    <p className="text-2xl font-bold text-blue-500">4</p>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>
                <DataTable
                    data={auditLogs}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default AuditLogs;