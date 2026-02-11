import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ReceiptGeneration: React.FC = () => {
    const [selectedPayment] = useState<number | null>(null);

    // Mock verified payments
    const verifiedPayments = [
        { id: 1, ambassador: 'John Doe', code: 'RA001', amount: 5000, type: 'Membership', date: '2026-01-10' },
        { id: 2, ambassador: 'Jane Smith', code: 'RA002', amount: 3000, type: 'Exam Fee', date: '2026-01-09' },
        { id: 3, ambassador: 'Mike Johnson', code: 'RA003', amount: 2500, type: 'Camp Fee', date: '2026-01-08' },
    ];

    const generateReceipt = (paymentId: number) => {
        // Mock receipt generation
        console.log('Generating receipt for payment:', paymentId);
        alert('Receipt generated successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Receipt Generation</h1>
                <p className="text-slate-400">Generate official receipts for verified payments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Receipts Generated Today</p>
                    <p className="text-2xl font-bold text-green-500">8</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Total Receipts This Month</p>
                    <p className="text-2xl font-bold text-gold-500">156</p>
                </Card>
                <Card className="p-4">
                    <p className="text-slate-400 text-sm">Pending Receipts</p>
                    <p className="text-2xl font-bold text-yellow-500">3</p>
                </Card>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Verified Payments</h3>
                </div>
                <div className="space-y-4">
                    {verifiedPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-navy-800/50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <div className="font-medium text-white">{payment.ambassador}</div>
                                    <div className="text-xs text-slate-400">{payment.code} • {payment.type} • {payment.date}</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gold-500 font-semibold">₦{payment.amount.toLocaleString()}</span>
                                <Button
                                    size="sm"
                                    onClick={() => generateReceipt(payment.id)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Generate Receipt
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Receipt Preview */}
            {selectedPayment && (
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">Receipt Preview</h3>
                    <div className="bg-white p-6 rounded-lg text-black">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">ROYAL AMBASSADORS OGBC</h2>
                            <p className="text-sm">Official Receipt</p>
                        </div>
                        <div className="space-y-2">
                            <p><strong>Receipt No:</strong> RA-{selectedPayment}-2026</p>
                            <p><strong>Date:</strong> January 12, 2026</p>
                            <p><strong>Ambassador:</strong> John Doe</p>
                            <p><strong>Amount:</strong> ₦5,000</p>
                            <p><strong>Purpose:</strong> Membership Fee</p>
                        </div>
                        <div className="mt-8 text-center">
                            <p className="text-sm">Thank you for your contribution</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ReceiptGeneration;