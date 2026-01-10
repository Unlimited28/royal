import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockBlogPosts } from '../../utils/mockData';

export const ContentModeration: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');

    // Simulate content items with moderation status
    const contentItems = mockBlogPosts.map(post => ({
        ...post,
        moderation_status: 'approved' as const,
        flagged_count: 0
    }));

    const columns = [
        {
            header: 'Content',
            cell: (item: typeof contentItems[0]) => (
                <div>
                    <div className="font-medium text-white">{item.title}</div>
                    <div className="text-xs text-slate-400">By {item.author} • {item.category}</div>
                </div>
            )
        },
        {
            header: 'Type',
            cell: () => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    BLOG POST
                </span>
            )
        },
        {
            header: 'Status',
            cell: (item: typeof contentItems[0]) => {
                const statusConfig = {
                    approved: { icon: 'ri-checkbox-circle-line', color: 'green', label: 'APPROVED' },
                    pending: { icon: 'ri-error-warning-line', color: 'yellow', label: 'PENDING' },
                    flagged: { icon: 'ri-close-circle-line', color: 'red', label: 'FLAGGED' }
                };
                const config = statusConfig[item.moderation_status];

                return (
                    <div className="flex items-center space-x-2">
                        <i className={`${config.icon} text-${config.color}-500`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-500/10 text-${config.color}-500`}>
                            {config.label}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Reports',
            cell: (item: typeof contentItems[0]) => (
                <span className="text-slate-300">{item.flagged_count}</span>
            )
        },
        {
            header: 'Date',
            cell: (item: typeof contentItems[0]) => (
                <span className="text-slate-300">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        Review
                    </Button>
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Total Content', value: contentItems.length, color: 'gold' },
        { label: 'Approved', value: contentItems.filter(i => i.moderation_status === 'approved').length, color: 'green' },
        { label: 'Pending', value: 0, color: 'yellow' },
        { label: 'Flagged', value: 0, color: 'red' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
                <p className="text-slate-400">Review and moderate user-generated content</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Content Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-shield-check-line mr-2 text-accent" />
                        Content Items
                    </h3>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'flagged')}
                        className="px-4 py-2 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="flagged">Flagged</option>
                    </select>
                </div>

                <DataTable
                    data={contentItems}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
