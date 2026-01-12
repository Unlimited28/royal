import React from 'react';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';

export const AuditLogs: React.FC = () => {
    // Mock audit logs
    const auditLogs = [
        { id: 1, user: 'Admin User', action: 'User Login', details: 'Successful login', timestamp: '2026-01-12 10:30:00', ip: '192.168.1.1' },
        { id: 2, user: 'Pastor Emmanuel', action: 'Exam Approval', details: 'Approved exam for RA001', timestamp: '2026-01-12 09:15:00', ip: '192.168.1.2' },
        { id: 3, user: 'Admin User', action: 'Payment Verification', details: 'Verified payment ₦5000', timestamp: '2026-01-12 08:45:00', ip: '192.168.1.1' },
        { id: 4, user: 'System', action: 'Backup Completed', details: 'Daily backup successful', timestamp: '2026-01-12 02:00:00', ip: '127.0.0.1' },
        { id: 5, user: 'Pastor Mary', action: 'Camp Registration', details: 'Uploaded camp files', timestamp: '2026-01-11 16:20:00', ip: '192.168.1.3' },
    ];

    const columns = [
        {
            header: 'User',
            cell: (log: typeof auditLogs[0]) => (
                <div>
                    <div className="font-medium text-white">{log.user}</div>
                    <div className="text-xs text-slate-400">{log.ip}</div>
                </div>
            )
        },
        {
            header: 'Action',
            cell: (log: typeof auditLogs[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {log.action}
                </span>
            )
        },
        {
            header: 'Details',
            cell: (log: typeof auditLogs[0]) => (
                <span className="text-slate-300">{log.details}</span>
            )
        },
        {
            header: 'Timestamp',
            cell: (log: typeof auditLogs[0]) => (
                <span className="text-slate-300 text-sm">{log.timestamp}</span>
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
                />
            </Card>
        </div>
    );
};

export default AuditLogs;