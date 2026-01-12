import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockExamResults, mockExams } from '../../utils/mockData';

export const MyResults: React.FC = () => {
    // Filter results for current user (simulated)
    const myResults = mockExamResults.map(result => {
        const exam = mockExams.find(e => e.id === result.exam_id);
        return {
            ...result,
            exam_title: exam?.title || 'Unknown Exam',
            exam_rank: exam?.rank_required || 'N/A'
        };
    });

    const columns = [
        {
            header: 'Exam',
            cell: (result: typeof myResults[0]) => (
                <div>
                    <div className="font-medium text-white">{result.exam_title}</div>
                    <div className="text-xs text-slate-400">Rank: {result.exam_rank}</div>
                </div>
            )
        },
        {
            header: 'Score',
            cell: (result: typeof myResults[0]) => (
                <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {result.score}%
                    </span>
                </div>
            )
        },
        {
            header: 'Result',
            cell: (result: typeof myResults[0]) => (
                <div className="flex items-center space-x-2">
                    {result.passed ? (
                        <>
                            <i className="ri-checkbox-circle-line text-green-500" />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                PASSED
                            </span>
                        </>
                    ) : (
                        <>
                            <i className="ri-close-circle-line text-red-500" />
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                FAILED
                            </span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Date Taken',
            cell: (result: typeof myResults[0]) => (
                <div className="flex items-center space-x-2 text-slate-300">
                    <i className="ri-time-line" />
                    <span>
                        {new Date(result.date_taken).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            )
        }
    ];

    const passedCount = myResults.filter(r => r.passed).length;
    const failedCount = myResults.filter(r => !r.passed).length;
    const averageScore = myResults.length > 0
        ? Math.round(myResults.reduce((sum, r) => sum + r.score, 0) / myResults.length)
        : 0;

    const stats = [
        { label: 'Total Exams', value: myResults.length, color: 'gold', icon: 'ri-trophy-line' },
        { label: 'Passed', value: passedCount, color: 'green', icon: 'ri-checkbox-circle-line' },
        { label: 'Failed', value: failedCount, color: 'red', icon: 'ri-close-circle-line' },
        { label: 'Average Score', value: `${averageScore}%`, color: 'blue', icon: 'ri-trophy-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">My Results</h1>
                <p className="text-slate-400">View your exam performance and history</p>
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

            {/* Results Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-trophy-line mr-2 text-gold-500" />
                        Exam History
                    </h3>
                </div>

                <DataTable
                    data={myResults}
                    columns={columns}
                />
            </Card>

            {/* Performance Insights */}
            {myResults.length > 0 && (
                <Card className={`${passedCount > failedCount
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-yellow-500/10 border-yellow-500/50'
                    }`}>
                    <h3 className="text-lg font-bold text-white mb-3">📊 Performance Insights</h3>
                    <div className="space-y-2 text-slate-300 text-sm">
                        {passedCount > failedCount ? (
                            <>
                                <p>✅ Great job! You're passing most of your exams.</p>
                                <p>Keep up the excellent work and continue advancing through the ranks!</p>
                            </>
                        ) : (
                            <>
                                <p>📚 Consider reviewing the study materials before retaking exams.</p>
                                <p>Remember, you have up to 3 attempts per exam to achieve a passing score.</p>
                            </>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MyResults;
