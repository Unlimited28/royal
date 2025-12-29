import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockBlogPosts } from '../../utils/mockData';

export const BlogManagement: React.FC = () => {
    const columns = [
        {
            header: 'Title',
            cell: (post: typeof mockBlogPosts[0]) => (
                <div>
                    <div className="font-medium text-white">{post.title}</div>
                    <div className="text-xs text-slate-400">By {post.author}</div>
                </div>
            )
        },
        {
            header: 'Category',
            cell: (post: typeof mockBlogPosts[0]) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                    {post.category}
                </span>
            )
        },
        {
            header: 'Created',
            cell: (post: typeof mockBlogPosts[0]) => (
                <span className="text-slate-300">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
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
            cell: (post: typeof mockBlogPosts[0]) => (
                <div className="flex items-center space-x-2">
                    <Link
                        to={`/blog/${post.slug}`}
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="View Post"
                    >
                        <i className="ri-eye-line text-blue-500" />
                    </Link>
                    <Link
                        to={`/admin/blog/edit/${post.id}`}
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Edit Post"
                    >
                        <i className="ri-pencil-line text-gold-500" />
                    </Link>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Delete Post"
                    >
                        <i className="ri-delete-bin-line text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Total Posts', value: mockBlogPosts.length, color: 'gold' },
        { label: 'Published', value: mockBlogPosts.length, color: 'green' },
        { label: 'Drafts', value: 0, color: 'yellow' },
        { label: 'Categories', value: 4, color: 'blue' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blog Management</h1>
                    <p className="text-slate-400">Create and manage blog posts</p>
                </div>
                <Link to="/admin/blog/create">
                    <Button>
                        <i className="ri-add-line mr-2" />
                        Create New Post
                    </Button>
                </Link>
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

            {/* Blog Posts Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">All Blog Posts</h3>
                </div>

                <DataTable
                    data={mockBlogPosts}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
