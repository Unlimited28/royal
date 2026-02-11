import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const PaymentVerification: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments');
            setPayments(response.data.map((p: any) => ({ ...p, id: p._id })));
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleVerify = async (paymentId: string, status: 'approved' | 'rejected') => {
        try {
            await api.patch(`/payments/${paymentId}/verify`, { status });
            toast.success(`Payment ${status} successfully`);
            fetchPayments();
        } catch (error) {
            console.error('Failed to verify payment:', error);
            toast.error('Failed to verify payment');
        }
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (payment: any) => (
                <div>
                    <div className="font-medium text-white">
                        {payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{payment.userId?.userCode || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Type',
            cell: (payment: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {payment.type}
                </span>
            )
        },
        {
            header: 'Amount',
            cell: (payment: any) => (
                <span className="text-gold-500 font-semibold">₦{payment.amount.toLocaleString()}</span>
            )
        },
        {
            header: 'Date',
            cell: (payment: any) => (
                <span className="text-slate-300">{new Date(payment.createdAt).toLocaleDateString()}</span>
            )
        },
        {
            header: 'Actions',
            cell: (payment: any) => (
                <div className="flex space-x-2">
                    {payment.status === 'pending' ? (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify(payment.id, 'approved')}>Verify</Button>
                            <Button size="sm" variant="outline" onClick={() => handleVerify(payment.id, 'rejected')}>Reject</Button>
                        </>
                    ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {payment.status.toUpperCase()}
                        </span>
                    )}
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
                    data={payments}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default PaymentVerification;