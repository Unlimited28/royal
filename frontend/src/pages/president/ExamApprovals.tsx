import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ExamApprovals: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApprovals = async () => {
        try {
            const response = await api.get('/exams/approvals');
            setRequests(response.data.map((r: any) => ({
                ...r,
                id: r._id,
                ambassadorName: r.ambassadorId ? `${r.ambassadorId.firstName} ${r.ambassadorId.lastName}` : 'Unknown',
                ambassadorCode: r.ambassadorId?.userCode || 'N/A',
            })));
        } catch (error) {
            console.error('Failed to fetch approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        try {
            await api.patch(`/exams/approvals/${id}`, { status });
            toast.success(`Request ${status} successfully`);
            fetchApprovals();
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to update status');
        }
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (req: any) => (
                <div>
                    <div className="font-medium text-white">{req.ambassadorName}</div>
                    <div className="text-xs text-slate-400 font-mono">{req.ambassadorCode}</div>
                </div>
            )
        },
        {
            header: 'Current Rank',
            cell: (req: any) => (
                <span className="px-2 py-1 rounded bg-navy-800 text-slate-300 text-xs">
                    {req.currentRank}
                </span>
            )
        },
        {
            header: 'Target Exam',
            cell: (req: any) => (
                <span className="text-gold-500 font-medium">{req.nextRank}</span>
            )
        },
        {
            header: 'Prev. Exam Date',
            cell: (req: any) => (
                <span className="text-slate-400 text-sm">
                    {req.previousExamDate ? new Date(req.previousExamDate).toLocaleDateString() : 'N/A'}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (req: any) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                }`}>
                    {req.status}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (req: any) => (
                <div className="flex items-center space-x-2">
                    {req.status === 'pending' && (
                        <>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 h-8 px-3"
                                onClick={() => handleAction(req.id, 'approved')}
                            >
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10 h-8 px-3"
                                onClick={() => handleAction(req.id, 'rejected')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {req.status !== 'pending' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            onClick={() => handleAction(req.id, 'pending')}
                        >
                            Reset
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Exam Eligibility Approvals</h1>
                <p className="text-slate-400">Approve ambassadors to sit for their next rank examinations</p>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-navy-700 bg-navy-800/30">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-user-follow-line mr-2 text-gold-500" />
                        Pending Requests
                    </h3>
                </div>

                <DataTable
                    data={requests}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card className="p-6 border-l-4 border-yellow-500">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-bold">Pending</p>
                    <p className="text-3xl font-bold text-white">{requests.filter(r => r.status === 'pending').length}</p>
                </Card>
                <Card className="p-6 border-l-4 border-green-500">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-bold">Approved</p>
                    <p className="text-3xl font-bold text-white">{requests.filter(r => r.status === 'approved').length}</p>
                </Card>
                <Card className="p-6 border-l-4 border-red-500">
                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-bold">Rejected</p>
                    <p className="text-3xl font-bold text-white">{requests.filter(r => r.status === 'rejected').length}</p>
                </Card>
            </div>
        </div>
    );
};

export default ExamApprovals;
