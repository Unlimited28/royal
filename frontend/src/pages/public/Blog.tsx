
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import CorporateAds from '../../components/common/CorporateAds';

const Blog: React.FC = () => {
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/blogs');
                setBlogPosts(response.data);
            } catch (error) {
                console.error('Failed to fetch blog posts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="text-white p-20 text-center">Loading articles...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Royal Ambassadors <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Blog</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Stay updated with the latest news, events, and inspirational content from our community.
                </p>
            </section>

            {/* Featured Post */}
            {blogPosts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-white mb-8">Featured Article</h2>
                    <Card className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <div className="flex items-center space-x-4 mb-4">
                                    <span className="px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm font-medium">
                                        {blogPosts[0].category}
                                    </span>
                                    <span className="text-slate-400 text-sm">
                                        {new Date(blogPosts[0].createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{blogPosts[0].title}</h3>
                                <p className="text-slate-400 mb-6 leading-relaxed">{blogPosts[0].excerpt || blogPosts[0].content?.substring(0, 150)}...</p>
                                <Link to={`/blog/${blogPosts[0]._id}`}>
                                    <Button>Read Full Article</Button>
                                </Link>
                            </div>
                            <div className="bg-navy-800 rounded-lg h-64 flex items-center justify-center">
                                <i className="ri-image-line text-6xl text-slate-600" />
                            </div>
                        </div>
                    </Card>
                </section>
            )}

            {/* Recent Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <section className="lg:col-span-3">
                    <h2 className="text-2xl font-bold text-white mb-8">Recent Posts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogPosts.slice(1).map((post) => (
                            <Card key={post._id} className="p-6 hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className="px-2 py-1 bg-gold-500/20 text-gold-500 rounded text-xs font-medium">
                                        {post.category}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt || post.content?.substring(0, 100)}...</p>
                                <Link to={`/blog/${post._id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Read More
                                    </Button>
                                </Link>
                            </Card>
                        ))}
                        {blogPosts.length === 0 && <p className="text-slate-500 italic">No articles found.</p>}
                    </div>
                </section>

                <aside className="lg:col-span-1 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6">Promotions</h2>
                        <CorporateAds placement="Sidebar" />
                    </div>
                </aside>
            </div>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-8">Categories</h2>
                <div className="flex flex-wrap gap-4">
                    {['Events', 'Leadership', 'Faith', 'Community', 'Testimonials'].map((category) => (
                        <Button key={category} variant="outline" className="border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-navy-900">
                            {category}
                        </Button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Blog;
