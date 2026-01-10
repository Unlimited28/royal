import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockExams } from '../../utils/mockData';

export const ExamManagement: React.FC = () => {
    const columns = [
        {
            header: 'Exam Title',
            cell: (exam: typeof mockExams[0]) => (
                <div>
                    <div className="font-medium text-white">{exam.title}</div>
                    <div className="text-xs text-slate-400">{exam.questions_count} questions</div>
                </div>
            )
        },
        { header: 'Rank Required', accessorKey: 'rank_required' as const },
        {
            header: 'Duration',
            cell: (exam: typeof mockExams[0]) => (
                <span className="text-slate-300">{exam.duration_minutes} mins</span>
            )
        },
        {
            header: 'Pass Score',
            cell: (exam: typeof mockExams[0]) => (
                <span className="text-slate-300">{exam.pass_score}%</span>
            )
        },
        {
            header: 'Status',
            cell: () => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    PUBLISHED
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (exam: typeof mockExams[0]) => (
                <div className="flex items-center space-x-2">
                    <Link
                        to={`/admin/exams/questions/${exam.id}`}
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="View Questions"
                    >
                        <i className="ri-eye-line text-blue-500" />
                    </Link>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Edit Exam"
                    >
                        <i className="ri-pencil-line text-accent" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Exam Management</h1>
                    <p className="text-slate-400">Create and manage ranking examinations</p>
                </div>
                <Link to="/admin/exams/create">
                    <Button>
                        <i className="ri-add-line mr-2" />
                        Create New Exam
                    </Button>
                </Link>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-file-text-line mr-2 text-accent" />
                        All Exams
                    </h3>
                    <div className="text-sm text-slate-400">
                        {mockExams.length} total exams
                    </div>
                </div>

                <DataTable
                    data={mockExams}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
