import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockBlogPosts } from '../../utils/mockData';

const EditBlogPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const post = mockBlogPosts.find(p => p.id === Number(id));

    const [formData, setFormData] = useState({
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        category: post?.category || 'Events',
        featured_image: post?.featured_image || ''
    });

    if (!post) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
                <Link to="/admin/blog" className="text-gold-500 hover:text-gold-400">
                    ← Back to Blog Management
                </Link>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating blog post:', formData);
        navigate('/admin/blog');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/admin/blog"
                className="inline-flex items-center text-gold-500 hover:text-gold-400 transition-colors"
            >
                <i className="ri-arrow-left-line mr-2" />
                Back to Blog Management
            </Link>

            <div>
                <h1 className="text-3xl font-bold text-white">Edit Blog Post</h1>
                <p className="text-slate-400">Update post details and content</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Post Details</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-slate-300 font-medium mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-slate-300 font-medium mb-2">
                                Slug *
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors font-mono text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-slate-300 font-medium mb-2">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                                required
                            >
                                <option value="Events">Events</option>
                                <option value="Achievements">Achievements</option>
                                <option value="Ministry">Ministry</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="excerpt" className="block text-slate-300 font-medium mb-2">
                                Excerpt *
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-slate-300 font-medium mb-2">
                                Content *
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={12}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 font-medium mb-2">
                                Featured Image
                            </label>
                            <div className="border-2 border-dashed border-navy-700 rounded-lg p-8 text-center hover:border-gold-500 transition-colors cursor-pointer">
                                <i className="ri-image-add-line text-5xl text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400 mb-2">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex items-center justify-end space-x-4">
                    <Link to="/admin/blog">
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit">
                        <i className="ri-save-line mr-2" />
                        Update Post
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditBlogPost;
