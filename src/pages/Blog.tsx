import React from 'react';
import { Link } from 'react-router-dom';
import { mockBlogPosts } from '../utils/mockData';

export const Blog: React.FC = () => {
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
                            <Link to="/register" className="px-4 py-2 rounded-lg bg-gold-500 text-navy-950 hover:bg-gold-600 transition-all font-medium">
                                Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            <header className="pt-32 pb-16 text-center bg-gradient-to-b from-navy-900/50 to-transparent">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gold-500 bg-clip-text text-transparent">
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
                                className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300"
                            >
                                {/* Featured Image Placeholder */}
                                <div className="h-64 bg-gradient-to-br from-navy-800 to-navy-700 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gold-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <span className="text-3xl">📸</span>
                                        </div>
                                        <p className="text-slate-500 text-sm">{post.category}</p>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold mb-4">
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-white hover:text-gold-500 transition-colors"
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
                                        className="inline-flex items-center text-gold-500 hover:text-gold-400 font-medium transition-colors"
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
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4 pb-3 border-b border-navy-700">
                                Recent Posts
                            </h4>
                            <ul className="space-y-3">
                                {mockBlogPosts.slice(0, 3).map((post) => (
                                    <li key={post.id}>
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-slate-400 hover:text-gold-500 transition-colors text-sm block py-2"
                                        >
                                            {post.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4 pb-3 border-b border-navy-700">
                                Categories
                            </h4>
                            <ul className="space-y-3">
                                {['Events', 'Achievements', 'Ministry', 'Education'].map((category) => (
                                    <li key={category}>
                                        <button className="text-slate-400 hover:text-gold-500 transition-colors text-sm block py-2 w-full text-left">
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
