import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { RANK_HIERARCHY_LIST } from '../../utils/logic';

interface EligibilityRequest {
    id: string;
    ambassadorName: string;
    ambassadorId: string;
    currentRank: string;
    nextRank: string;
    previousExamDate: string;
    status: 'pending' | 'approved' | 'rejected';
}

export const ExamApprovals: React.FC = () => {
    const [requests, setRequests] = useState<EligibilityRequest[]>([]);

    useEffect(() => {
        // In a real app, this would be an API call
        // We'll initialize with some mock data if localStorage is empty
        const stored = localStorage.getItem('ogbc_exam_approvals');
        if (stored) {
            setRequests(JSON.parse(stored));
        } else {
            const initialRequests: EligibilityRequest[] = [
                {
                    id: '1',
                    ambassadorName: 'Ajibola Olowu',
                    ambassadorId: `ogbc//ra//${new Date().getFullYear()}//001`,
                    currentRank: 'Candidate',
                    nextRank: 'Assistant Intern',
                    previousExamDate: '2023-12-15',
                    status: 'pending'
                },
                {
                    id: '2',
                    ambassadorName: 'Jane Smith',
                    ambassadorId: 'ogbc//ra//2024//456',
                    currentRank: 'Assistant Intern',
                    nextRank: 'Intern',
                    previousExamDate: '2024-01-20',
                    status: 'pending'
                }
            ];
            setRequests(initialRequests);
            localStorage.setItem('ogbc_exam_approvals', JSON.stringify(initialRequests));
        }
    }, []);

    const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
        const updatedRequests = requests.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        );
        setRequests(updatedRequests);
        localStorage.setItem('ogbc_exam_approvals', JSON.stringify(updatedRequests));
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (req: EligibilityRequest) => (
                <div>
                    <div className="font-medium text-white">{req.ambassadorName}</div>
                    <div className="text-xs text-slate-400 font-mono">{req.ambassadorId}</div>
                </div>
            )
        },
        {
            header: 'Current Rank',
            cell: (req: EligibilityRequest) => (
                <span className="px-2 py-1 rounded bg-navy-800 text-slate-300 text-xs">
                    {req.currentRank}
                </span>
            )
        },
        {
            header: 'Target Exam',
            cell: (req: EligibilityRequest) => (
                <span className="text-gold-500 font-medium">{req.nextRank}</span>
            )
        },
        {
            header: 'Prev. Exam Date',
            cell: (req: EligibilityRequest) => (
                <span className="text-slate-400 text-sm">
                    {new Date(req.previousExamDate).toLocaleDateString()}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (req: EligibilityRequest) => (
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
            cell: (req: EligibilityRequest) => (
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
                            onClick={() => {
                                const updated = requests.map(r => r.id === req.id ? {...r, status: 'pending'} : r);
                                setRequests(updated as EligibilityRequest[]);
                                localStorage.setItem('ogbc_exam_approvals', JSON.stringify(updated));
                            }}
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
