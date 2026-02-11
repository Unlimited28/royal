import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';

const ExamManagement: React.FC = () => {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await api.get('/exams');
                setExams(response.data);
            } catch (error) {
                console.error('Failed to fetch exams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const columns = [
        {
            header: 'Exam Title',
            cell: (exam: any) => (
                <div>
                    <div className="font-medium text-white">{exam.title}</div>
                    <div className="text-xs text-slate-400">{exam.questions?.length || 0} questions</div>
                </div>
            )
        },
        { header: 'Target Rank', accessorKey: 'targetRank' as const },
        {
            header: 'Duration',
            cell: (exam: any) => (
                <span className="text-slate-300">{exam.duration_minutes} mins</span>
            )
        },
        {
            header: 'Pass Score',
            cell: (exam: any) => (
                <span className="text-slate-300">{exam.pass_score}%</span>
            )
        },
        {
            header: 'Status',
            cell: (exam: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {exam.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (exam: any) => (
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
                        <i className="ri-pencil-line text-gold-500" />
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
                <div className="flex items-center space-x-3">
                    <Link to="/admin/exams/release">
                        <Button variant="outline">
                            <i className="ri-send-plane-line mr-2" />
                            Release Results
                        </Button>
                    </Link>
                    <Link to="/admin/exams/create">
                        <Button>
                            <i className="ri-add-line mr-2" />
                            Create New Exam
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-file-text-line mr-2 text-gold-500" />
                        All Exams
                    </h3>
                    <div className="text-sm text-slate-400">
                        {exams.length} total exams
                    </div>
                </div>

                <DataTable
                    data={exams}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default ExamManagement;
