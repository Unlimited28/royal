import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

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
                            <Link to="/blog" className="text-slate-300 hover:text-white transition-colors">Blog</Link>
                            <Link to="/gallery" className="text-slate-300 hover:text-white transition-colors">Gallery</Link>
                            <Link to="/contact" className="text-gold-500 font-medium">Contact</Link>
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
                        Get In Touch
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        We'd love to hear from you. Send us a message or find our contact details below.
                    </p>
                </div>
            </header>

            {/* Contact Layout */}
            <div className="py-20 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-slate-300 font-medium mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-slate-300 font-medium mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-slate-300 font-medium mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    <i className="ri-send-plane-line mr-2" />
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-navy-900/50 to-navy-800/30 border border-navy-700 rounded-2xl p-6">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i className="ri-map-pin-line text-2xl text-gold-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Address</h4>
                                    <p className="text-slate-400 text-sm">
                                        Ogun Baptist Conference HQ, Abeokuta, Ogun State, Nigeria.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i className="ri-mail-line text-2xl text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Email</h4>
                                    <p className="text-slate-400 text-sm">contact@ra-ogun.org</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i className="ri-phone-line text-2xl text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-2">Phone</h4>
                                    <p className="text-slate-400 text-sm">+234 123 456 7890</p>
                                </div>
                            </div>
                        </div>
                    </div>
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
