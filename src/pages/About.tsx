import React from 'react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
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
                            <Link to="/about" className="text-gold-500 font-medium">About</Link>
                            <Link to="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link>
                            <Link to="/gallery" className="text-slate-300 hover:text-white transition-colors">Gallery</Link>
                            <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
                            <Link to="/login" className="px-4 py-2 rounded-lg border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-all">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Header */}
            <header className="pt-32 pb-16 text-center bg-gradient-to-b from-navy-900/50 to-transparent">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-gold-500 bg-clip-text text-transparent">
                        About the Royal Ambassadors
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Learn about our mission, vision, and the values that guide our journey in faith and leadership.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-white to-gold-500 bg-clip-text text-transparent">
                            Our Foundation
                        </h2>
                        <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            The Royal Ambassadors, Ogun Baptist Conference is a Christ-centered organization dedicated to developing young Christian leaders through faith-based education, character building, and community service. We empower boys and young men to become ambassadors for Christ in their communities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Mission Card */}
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-8 hover:border-gold-500/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="ri-focus-3-line text-2xl text-gold-500" />
                            </div>
                            <h4 className="text-xl font-bold text-gold-500 mb-4">Our Mission</h4>
                            <p className="text-slate-400 leading-relaxed">
                                To train boys and young men in Christian discipleship, leadership, and service through Bible study, missions education, and practical ministry opportunities that transform lives and communities.
                            </p>
                        </div>

                        {/* Vision Card */}
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="ri-eye-line text-2xl text-blue-500" />
                            </div>
                            <h4 className="text-xl font-bold text-blue-500 mb-4">Our Vision</h4>
                            <p className="text-slate-400 leading-relaxed">
                                To raise a generation of godly young men who are equipped to impact their world for Christ, demonstrating excellence in character, leadership, and service across Nigeria and beyond.
                            </p>
                        </div>

                        {/* Values Card */}
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="ri-heart-line text-2xl text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold text-green-500 mb-4">Our Values</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Faith, Excellence, Service, Leadership, Community, and Integrity guide everything we do in developing tomorrow's Christian leaders.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-navy-950 to-navy-900 border-t border-navy-800 py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            <span className="text-navy-950 font-bold text-xl">RA</span>
                        </div>
                        <span className="text-xl font-bold text-white">Royal Ambassadors - Ogun Baptist Conference</span>
                    </div>
                    <p className="text-slate-400 mb-6">
                        Empowering young Christian leaders across Ogun State through faith, education, and service.
                    </p>
                    <div className="border-t border-navy-800 pt-6">
                        <p className="text-slate-500 text-sm">
                            © 2025 Royal Ambassadors Ogun Baptist Conference. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
