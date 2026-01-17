import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockCampRegistrations, mockUsers } from '../../utils/mockData';
import toast from 'react-hot-toast';

export const CampRegistrations: React.FC = () => {
    const [registrations, setRegistrations] = useState(mockCampRegistrations);
    const [isUploading, setIsUploading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'none' | 'pending'>('none');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        // Simulate processing delay
        setTimeout(() => {
            const associationAmbassadors = mockUsers.filter(u => u.role === 'ambassador');
            const newRegs = associationAmbassadors.map((u, index) => ({
                id: Date.now() + index,
                user_id: u.id,
                ambassador_name: u.full_name,
                ambassador_code: u.user_code,
                camp_year: 2024,
                camp_type: "Annual Camp",
                registration_date: new Date().toISOString().split('T')[0],
                payment_status: 'pending' as const,
                payment_amount: 15000,
                amount: 15000,
                created_at: new Date().toISOString()
            }));

            setRegistrations([...newRegs, ...registrations]);
            setIsUploading(false);
            toast.success(`Successfully uploaded ${newRegs.length} ambassadors from Excel!`);
        }, 1500);
    };

    const handleInitiatePayment = () => {
        setPaymentStatus('pending');
        toast.success('Payment initiated! Awaiting Super Admin approval.');
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <div>
                    <div className="font-medium text-white">{reg.ambassador_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{reg.ambassador_code}</div>
                </div>
            )
        },
        {
            header: 'Camp Type',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {reg.camp_type}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reg.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' :
                    paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                }`}>
                    {reg.payment_status === 'paid' ? 'CONFIRMED' : (paymentStatus === 'pending' ? 'PENDING APPROVAL' : 'UNPAID')}
                </span>
            )
        },
        {
            header: 'Amount',
            cell: (reg: typeof mockCampRegistrations[0]) => (
                <span className="text-gold-500 font-bold">₦{(reg.amount || 15000).toLocaleString()}</span>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Association Camp Management</h1>
                    <p className="text-slate-400">Bulk upload and payment for association members</p>
                </div>
                <div className="flex items-center space-x-3">
                    <label className="cursor-pointer inline-flex items-center">
                        <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={isUploading} />
                        <Button variant="outline" as="span" disabled={isUploading}>
                            <i className="ri-file-excel-line mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload Excel'}
                        </Button>
                    </label>
                    <Button onClick={handleInitiatePayment} disabled={paymentStatus === 'pending'}>
                        <i className="ri-bank-card-line mr-2" />
                        {paymentStatus === 'pending' ? 'Payment Pending' : 'Initiate Bulk Payment'}
                    </Button>
                </div>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-group-line mr-2 text-gold-500" />
                        Uploaded Ambassadors
                    </h3>
                </div>

                <DataTable
                    data={registrations}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default CampRegistrations;
