import React from 'react';
import { Link } from 'react-router-dom';
import { mockBlogPosts } from '../utils/mockData';
import { PublicNavbar } from '../components/layout/PublicNavbar';

export const Blog: React.FC = () => {
    return (
        <div className="min-h-screen bg-navy-950">
            <PublicNavbar />

            {/* Page Header */}
            <header className="pt-32 pb-16 text-center bg-gradient-to-b from-primary/50 to-transparent">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                        Our Blog
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        News, articles, and stories from the Royal Ambassadors community.
                    </p>
                </div>
            </header>

            {/* Blog Layout */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {mockBlogPosts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-gradient-to-br from-primary/50 to-primary-dark/30 border border-navy-700 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300"
                            >
                                {/* Featured Image Placeholder */}
                                <div className="h-64 bg-gradient-to-br from-primary-dark to-navy-700 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <span className="text-3xl">📸</span>
                                        </div>
                                        <p className="text-slate-500 text-sm">{post.category}</p>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-white hover:text-accent transition-colors"
                                        >
                                            {post.title}
                                        </Link>
                                    </h3>

                                    <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                                        <span className="flex items-center">
                                            <i className="ri-user-line mr-1" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center">
                                            <i className="ri-calendar-line mr-1" />
                                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <p className="text-slate-400 leading-relaxed mb-6">
                                        {post.excerpt}
                                    </p>

                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="inline-flex items-center text-accent hover:text-gold-400 font-medium transition-colors"
                                    >
                                        Read More
                                        <i className="ri-arrow-right-line ml-2" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="bg-gradient-to-br from-primary/50 to-primary-dark/30 border border-navy-700 rounded-2xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4 pb-3 border-b border-navy-700">
                                Recent Posts
                            </h4>
                            <ul className="space-y-3">
                                {mockBlogPosts.slice(0, 3).map((post) => (
                                    <li key={post.id}>
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-slate-400 hover:text-accent transition-colors text-sm block py-2"
                                        >
                                            {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-primary/50 to-primary-dark/30 border border-navy-700 rounded-2xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4 pb-3 border-b border-navy-700">
                                Categories
                            </h4>
                            <ul className="space-y-3">
                                {['Events', 'Achievements', 'Ministry', 'Education'].map((category) => (
                                    <li key={category}>
                                        <button className="text-slate-400 hover:text-accent transition-colors text-sm block py-2 w-full text-left">
                                            {category}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-navy-950 to-primary border-t border-primary-dark py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2025 Royal Ambassadors Ogun Baptist Conference. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};
