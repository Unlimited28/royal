import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockExams, mockUsers, mockExamResults } from '../../utils/mockData';
import { isEligible } from '../../utils/logic';

export const MyExams: React.FC = () => {
    // Check if user is logged in (simulated)
    // In a real app, this would come from AuthContext
    const currentUser = mockUsers[0]; // Simulating Ambassador: Adeboye Samuel (Rank: Page)

    // Calculate dynamic properties for each exam
    const examsList = mockExams.map(exam => {
        // Check if already taken
        const result = mockExamResults.find(r => r.exam_id === exam.id && r.user_id === currentUser.id);

        // Check eligibility
        const canTake = isEligible(currentUser.rank, exam.rank_required);
        const isTaken = !!result;

        let status: 'available' | 'taken' | 'locked' = 'locked';
        if (isTaken) status = 'taken';
        else if (canTake) status = 'available';

        return {
            ...exam,
            status,
            result,
            attempts: isTaken ? 1 : 0, // Mock attempt count
            max_attempts: 3
        };
    });

    const columns = [
        {
            header: 'Exam Title',
            cell: (exam: typeof examsList[0]) => (
                <div>
                    <div className="font-medium text-white">{exam.title}</div>
                    <div className="text-xs text-slate-400">{exam.description}</div>
                </div>
            )
        },
        {
            header: 'Rank Required',
            cell: (exam: typeof examsList[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                    {exam.rank_required}
                </span>
            )
        },
        {
            header: 'Duration',
            cell: (exam: typeof examsList[0]) => (
                <div className="flex items-center space-x-2 text-slate-300">
                    <i className="ri-time-line" />
                    <span>{exam.duration_minutes} mins</span>
                </div>
            )
        },
        {
            header: 'Questions',
            cell: (exam: typeof examsList[0]) => (
                <span className="text-slate-300">{exam.questions_count}</span>
            )
        },
        {
            header: 'Status', // Changed from Pass Score to Status for better visibility
            cell: (exam: typeof examsList[0]) => {
                if (exam.status === 'taken') {
                    return exam.result?.passed
                        ? <span className="text-green-500 flex items-center"><i className="ri-checkbox-circle-line mr-1" /> Passed ({exam.result.score}%)</span>
                        : <span className="text-red-500 flex items-center"><i className="ri-close-circle-line mr-1" /> Failed ({exam.result?.score}%)</span>;
                }
                if (exam.status === 'locked') {
                    return <span className="text-slate-500 flex items-center"><i className="ri-lock-line mr-1" /> Locked</span>;
                }
                return <span className="text-blue-500 font-bold">Available</span>;
            }
        },
        {
            header: 'Actions',
            cell: (exam: typeof examsList[0]) => (
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
                            {exam.status === 'taken' ? 'Completed' : 'Locked'}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Available Exams', value: examsList.filter(e => e.status === 'available').length, color: 'gold', icon: 'ri-file-text-line' },
        { label: 'Passed', value: examsList.filter(e => e.result?.passed).length, color: 'green', icon: 'ri-checkbox-circle-line' },
        { label: 'Failed', value: examsList.filter(e => e.result && !e.result.passed).length, color: 'red', icon: 'ri-close-circle-line' },
        { label: 'Locked', value: examsList.filter(e => e.status === 'locked').length, color: 'slate', icon: 'ri-lock-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">My Exams</h1>
                <p className="text-slate-400">View and take ranking examinations</p>
                <div className="mt-2 text-sm text-slate-500">
                    Simulating User: <span className="text-accent font-medium">{currentUser.name}</span> (Rank: {currentUser.rank})
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <i className={`${stat.icon} text-${stat.color}-500`} />
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Available Exams */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-file-text-line mr-2 text-accent" />
                        Examination Center
                    </h3>
                </div>

                <DataTable
                    data={examsList}
                    columns={columns}
                />
            </Card>

            {/* Exam Instructions */}
            <Card className="bg-blue-500/10 border-blue-500/50">
                <h3 className="text-lg font-bold text-white mb-3">📋 Exam Instructions</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• You have a maximum of 3 attempts per exam</li>
                    <li>• Each exam must be completed within the specified duration</li>
                    <li>• You must achieve the pass score to advance in rank</li>
                    <li>• Exams are unlocked based on your current rank</li>
                    <li>• Once started, the exam timer cannot be paused</li>
                </ul>
            </Card>
        </div>
    );
};
