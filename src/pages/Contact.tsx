import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PublicNavbar } from '../components/layout/PublicNavbar';

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
            <PublicNavbar />

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
