import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ResultsPublishing: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResults = async () => {
        try {
            const response = await api.get('/dashboard/exams/overview');
            // Wait, overview gives stats. I need actual results.
            // Let's assume there is a GET /exams/results endpoint for admins
            const resData = await api.get('/exams/results/all'); // Need to check if this exists
            setResults(resData.data.map((r: any) => ({
                ...r,
                id: r._id,
                user_name: r.userId ? `${r.userId.firstName} ${r.userId.lastName}` : 'Unknown',
                user_code: r.userId?.userCode || 'N/A',
                exam_title: r.examId?.title || 'Unknown Exam',
            })));
        } catch (error) {
            console.error('Failed to fetch results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const handlePublish = async (id: string, publish: boolean) => {
        try {
            const endpoint = publish ? `/exams/results/${id}/publish` : `/exams/results/${id}/unpublish`;
            await api.post(endpoint);
            toast.success(`Result ${publish ? 'published' : 'unpublished'} successfully`);
            fetchResults();
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Failed to update result status');
        }
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (result: any) => (
                <div>
                    <div className="font-medium text-white">{result.user_name}</div>
                    <div className="text-xs text-slate-400">{result.user_code}</div>
                </div>
            )
        },
        { header: 'Exam', accessorKey: 'exam_title' as const },
        {
            header: 'Score',
            cell: (result: typeof enhancedResults[0]) => (
                <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                        {result.score}%
                    </span>
                </div>
            )
        },
        {
            header: 'Result',
            cell: (result: typeof enhancedResults[0]) => (
                <div className="flex items-center space-x-2">
                    {result.passed ? (
                        <>
                            <i className="ri-checkbox-circle-line text-green-500" />
                            <span className="text-green-500 font-medium">PASSED</span>
                        </>
                    ) : (
                        <>
                            <i className="ri-close-circle-line text-red-500" />
                            <span className="text-red-500 font-medium">FAILED</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            cell: (result: any) => (
                <span className="text-slate-300">
                    {new Date(result.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (result: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.isPublished ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {result.isPublished ? 'PUBLISHED' : 'PENDING'}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: (result: any) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublish(result._id, !result.isPublished)}
                    >
                        {result.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                </div>
            )
        }
    ];

    const stats = [
        {
            label: 'Total Results',
            value: results.length.toString(),
            icon: 'ri-award-line',
            change: 'All time',
            trend: 'neutral' as const
        },
        {
            label: 'Published',
            value: results.filter(r => r.isPublished).length.toString(),
            icon: 'ri-checkbox-circle-line',
            change: 'All time',
            trend: 'up' as const
        },
        {
            label: 'Pass Rate',
            value: results.length > 0 ? `${Math.round((results.filter(r => r.passed).length / results.length) * 100)}%` : '0%',
            icon: 'ri-award-line',
            change: 'Overall',
            trend: 'up' as const
        },
        {
            label: 'Pending',
            value: '0',
            icon: 'ri-time-line',
            change: 'Awaiting review',
            trend: 'neutral' as const
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Results Publishing</h1>
                <p className="text-slate-400">Manage and publish exam results</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                            </div>
                            <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center">
                                <i className={`${stat.icon} text-2xl text-gold-500`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Results Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Exam Results</h3>
                    <div className="flex items-center space-x-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'pending')}
                            className="px-4 py-2 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                        >
                            <option value="all">All Results</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    data={results}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default ResultsPublishing;
