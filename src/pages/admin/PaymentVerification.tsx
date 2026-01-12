import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';

export const PaymentVerification: React.FC = () => {
    // Mock pending payments
    const pendingPayments = [
        { id: 1, ambassador: 'John Doe', code: 'RA001', amount: 5000, type: 'Membership', date: '2026-01-10', status: 'pending' },
        { id: 2, ambassador: 'Jane Smith', code: 'RA002', amount: 3000, type: 'Exam Fee', date: '2026-01-09', status: 'pending' },
        { id: 3, ambassador: 'Mike Johnson', code: 'RA003', amount: 2500, type: 'Camp Fee', date: '2026-01-08', status: 'pending' },
    ];

    const columns = [
        {
            header: 'Ambassador',
            cell: (payment: typeof pendingPayments[0]) => (
                <div>
                    <div className="font-medium text-white">{payment.ambassador}</div>
                    <div className="text-xs text-slate-400 font-mono">{payment.code}</div>
                </div>
            )
        },
        {
            header: 'Type',
            cell: (payment: typeof pendingPayments[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {payment.type}
                </span>
            )
        },
        {
            header: 'Amount',
            cell: (payment: typeof pendingPayments[0]) => (
                <span className="text-gold-500 font-semibold">₦{payment.amount.toLocaleString()}</span>
            )
        },
        {
            header: 'Date',
            cell: (payment: typeof pendingPayments[0]) => (
                <span className="text-slate-300">{payment.date}</span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Verify</Button>
                    <Button size="sm" variant="outline">Reject</Button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Payment Verification</h1>
                <p className="text-slate-400">Review and verify payment submissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-500">3</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Total Amount Pending</p>
                    <p className="text-2xl font-bold text-gold-500">₦10,500</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Verified Today</p>
                    <p className="text-2xl font-bold text-green-500">12</p>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Pending Payments</h3>
                </div>
                <DataTable
                    data={pendingPayments}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default PaymentVerification;