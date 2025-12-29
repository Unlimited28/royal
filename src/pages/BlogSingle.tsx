import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockBlogPosts } from '../utils/mockData';

export const BlogSingle: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = mockBlogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
                    <Link to="/blog" className="text-gold-500 hover:text-gold-400">
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-sm border-b border-navy-800">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                <span className="text-navy-950 font-bold text-xl">RA</span>
                            </div>
                            <span className="text-xl font-bold text-white">Royal Ambassadors</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
                            <Link to="/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
                            <Link to="/blog" className="text-gold-500 font-medium">Blog</Link>
                            <Link to="/gallery" className="text-slate-300 hover:text-white transition-colors">Gallery</Link>
                            <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
                            <Link to="/login" className="px-4 py-2 rounded-lg border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Article Content */}
            <article className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        to="/blog"
                        className="inline-flex items-center text-gold-500 hover:text-gold-400 mb-8 transition-colors"
                    >
                        <i className="ri-arrow-left-line mr-2" />
                        Back to Blog
                    </Link>

                    {/* Article Header */}
                    <header className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm font-medium flex items-center">
                                <i className="ri-price-tag-3-line mr-1" />
                                {post.category}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center space-x-6 text-slate-400">
                            <span className="flex items-center">
                                <i className="ri-user-line mr-2" />
                                {post.author}
                            </span>
                            <span className="flex items-center">
                                <i className="ri-calendar-line mr-2" />
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    </header>

                    {/* Featured Image Placeholder */}
                    <div className="h-96 bg-gradient-to-br from-navy-800 to-navy-700 rounded-2xl mb-12 flex items-center justify-center border border-navy-700">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">📸</span>
                            </div>
                            <p className="text-slate-500">Featured Image</p>
                        </div>
                    </div>

                    {/* Article Body */}
                    <div className="prose prose-invert prose-lg max-w-none">
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-8">
                            <p className="text-slate-300 leading-relaxed mb-6 text-lg">
                                {post.excerpt}
                            </p>
                            <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                                {post.content}
                            </p>
                        </div>
                    </div>

                    {/* Related Posts */}
                    <div className="mt-16 pt-12 border-t border-navy-800">
                        <h3 className="text-2xl font-bold text-white mb-6">Related Posts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mockBlogPosts
                                .filter(p => p.id !== post.id && p.category === post.category)
                                .slice(0, 2)
                                .map((relatedPost) => (
                                    <Link
                                        key={relatedPost.id}
                                        to={`/blog/${relatedPost.slug}`}
                                        className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-xl p-6 hover:border-gold-500/50 transition-all"
                                    >
                                        <h4 className="text-lg font-bold text-white mb-2">
                                            {relatedPost.title}
                                        </h4>
                                        <p className="text-slate-400 text-sm line-clamp-2">
                                            {relatedPost.excerpt}
                                        </p>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </div>
            </article>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-navy-950 to-navy-900 border-t border-navy-800 py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2025 Royal Ambassadors Ogun Baptist Conference. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
