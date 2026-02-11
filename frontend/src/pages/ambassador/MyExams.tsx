import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { isEligible } from '../../utils/logic';
import { useAuth } from '../../context/AuthContext';

import api from '../../services/api';

export const MyExams: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // In Phase 4, the backend should only return exams the user is eligible for/approved for
                // or the frontend filters based on backend data.
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

    if (!currentUser || loading) {
        return <div className="text-white p-8 text-center">Loading exams...</div>;
    }

    // Map and filter based on rank
    const examsList = exams.map(exam => {
        // For production, the backend should ideally handle eligibility.
        // But we'll keep the frontend check for safety.
        const isRankEligible = isEligible(currentUser.rank || 'Candidate', exam.targetRank);

        // In this unified flow, if the backend returns it, we consider it "potentially available"
        // If it's active and rank matches.
        let status: 'available' | 'locked' = isRankEligible && exam.isActive ? 'available' : 'locked';

        return {
            ...exam,
            id: exam._id,
            status,
            rank_required: exam.targetRank,
            questions_count: exam.questions?.length || 0
        };
    }).filter(exam => exam.status === 'available'); // Only show available ones to keep it clean

    const columns = [
        {
            header: 'Exam Title',
            cell: (exam: any) => (
                <div>
                    <div className="font-medium text-white">{exam.title}</div>
                    <div className="text-xs text-slate-400">{exam.description}</div>
                </div>
            )
        },
        {
            header: 'Target Rank',
            cell: (exam: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                    {exam.rank_required}
                </span>
            )
        },
        {
            header: 'Duration',
            cell: (exam: any) => (
                <div className="flex items-center space-x-2 text-slate-300">
                    <i className="ri-time-line" />
                    <span>{exam.duration_minutes} mins</span>
                </div>
            )
        },
        {
            header: 'Questions',
            cell: (exam: any) => (
                <span className="text-slate-300">{exam.questions_count}</span>
            )
        },
        {
            header: 'Status',
            cell: (exam: any) => {
                if (exam.status === 'available') {
                    return <span className="text-green-500 font-bold">READY TO START</span>;
                }
                return (
                    <span className="text-slate-500 flex items-center">
                        <i className="ri-lock-line mr-1" /> Locked
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            cell: (exam: any) => (
                <div className="flex items-center">
                    {exam.status === 'available' ? (
                        <Link to={`/ambassador/exam/${exam.id}`}>
                            <Button size="sm">
                                <i className="ri-play-line mr-2" />
                                Start Exam
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" variant="outline" disabled className="opacity-50 cursor-not-allowed">
                            Locked
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white">My Exams</h1>
                <p className="text-slate-400">Take examinations for your next rank</p>
            </div>

            {examsList.length > 0 ? (
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <i className="ri-file-text-line mr-2 text-gold-500" />
                            Approved Examinations
                        </h3>
                    </div>

                    <DataTable
                        data={examsList}
                        columns={columns}
                    />
                </Card>
            ) : (
                <Card className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center mb-6 mx-auto">
                        <i className="ri-file-search-line text-4xl text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Exams Available</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        You don't have any exams approved by your Association President yet. Once you're eligible and approved, they will appear here.
                    </p>
                </Card>
            )}

            <Card className="bg-blue-500/10 border-blue-500/50">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                    <i className="ri-information-line mr-2" />
                    How it works
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• You can only see exams for the rank immediately following your current rank.</li>
                    <li>• Your Association President must approve you before the exam becomes visible.</li>
                    <li>• Ensure you have a stable internet connection before starting an exam.</li>
                </ul>
            </Card>
        </div>
    );
};

export default MyExams;
