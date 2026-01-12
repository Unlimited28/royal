import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockExamResults, mockUsers, mockExams } from '../../utils/mockData';

const ExamApprovals: React.FC = () => {
    // Simulate pending exam approvals
    const pendingApprovals = mockExamResults.map(result => {
        const user = mockUsers.find(u => u.id === result.user_id);
        const exam = mockExams.find(e => e.id === result.exam_id);
        return {
            ...result,
            ambassador_name: user?.name || 'Unknown',
            ambassador_code: user?.ambassador_code || 'N/A',
            exam_title: exam?.title || 'Unknown Exam',
            approval_status: 'pending' as const
        };
    });

    const columns = [
        {
            header: 'Ambassador',
            cell: (approval: typeof pendingApprovals[0]) => (
                <div>
                    <div className="font-medium text-white">{approval.ambassador_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{approval.ambassador_code}</div>
                </div>
            )
        },
        {
            header: 'Exam',
            cell: (approval: typeof pendingApprovals[0]) => (
                <span className="text-slate-300">{approval.exam_title}</span>
            )
        },
        {
            header: 'Score',
            cell: (approval: typeof pendingApprovals[0]) => (
                <span className={`text-2xl font-bold ${approval.passed ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {approval.score}%
                </span>
            )
        },
        {
            header: 'Result',
            cell: (approval: typeof pendingApprovals[0]) => (
                <div className="flex items-center space-x-2">
                    {approval.passed ? (
                        <>
                            <i className="ri-checkbox-circle-line text-xl text-green-500" />
                            <span className="text-green-500 font-medium">PASSED</span>
                        </>
                    ) : (
                        <>
                            <i className="ri-close-circle-line text-xl text-red-500" />
                            <span className="text-red-500 font-medium">FAILED</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            cell: (approval: typeof pendingApprovals[0]) => (
                <span className="text-slate-300">
                    {new Date(approval.date_taken).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (approval: typeof pendingApprovals[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                    {approval.approval_status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                        <i className="ri-check-line mr-1" />
                        Approve
                    </Button>
                    <Button size="sm" variant="outline">
                        <i className="ri-close-line mr-1" />
                        Reject
                    </Button>
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Pending Approvals', value: pendingApprovals.length, color: 'yellow', icon: 'ri-time-line' },
        { label: 'Passed', value: pendingApprovals.filter(a => a.passed).length, color: 'green', icon: 'ri-checkbox-circle-line' },
        { label: 'Failed', value: pendingApprovals.filter(a => !a.passed).length, color: 'red', icon: 'ri-close-circle-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Exam Approvals</h1>
                <p className="text-slate-400">Review and approve exam results for your association</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <i className={`${stat.icon} text-xl text-${stat.color}-500`} />
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Approvals Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-time-line mr-2 text-gold-500" />
                        Pending Approvals
                    </h3>
                </div>

                <DataTable
                    data={pendingApprovals}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
export default ExamApprovals;
