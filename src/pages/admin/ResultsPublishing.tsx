import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockExamResults, mockUsers } from '../../utils/mockData';

export const ResultsPublishing: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all');

    // Enhance results with user data
    const enhancedResults = mockExamResults.map(result => {
        const user = mockUsers.find(u => u.id === result.user_id);
        return {
            ...result,
            user_name: user?.full_name || 'Unknown',
            user_code: user?.user_code || 'N/A',
            status: 'published' as const
        };
    });

    const columns = [
        {
            header: 'Ambassador',
            cell: (result: typeof enhancedResults[0]) => (
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
            cell: (result: typeof enhancedResults[0]) => (
                <span className="text-slate-300">
                    {new Date(result.date_taken).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
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
            cell: () => (
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            )
        }
    ];

    const stats = [
        {
            label: 'Total Results',
            value: enhancedResults.length.toString(),
            icon: 'ri-award-line',
            change: 'All time',
            trend: 'neutral' as const
        },
        {
            label: 'Published',
            value: enhancedResults.filter(r => r.status === 'published').length.toString(),
            icon: 'ri-checkbox-circle-line',
            change: 'This month',
            trend: 'up' as const
        },
        {
            label: 'Pass Rate',
            value: `${Math.round((enhancedResults.filter(r => r.passed).length / enhancedResults.length) * 100)}%`,
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
                            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                                <i className={`${stat.icon} text-2xl text-accent`} />
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
                            className="px-4 py-2 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                        >
                            <option value="all">All Results</option>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    data={enhancedResults}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
