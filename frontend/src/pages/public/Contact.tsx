
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const Contact: React.FC = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Us</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Get in touch with us for inquiries, support, or partnership opportunities.
                </p>
            </section>

            {/* Contact Form & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <Card className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                    placeholder="Your first name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                    placeholder="Your last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                placeholder="How can we help you?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500 resize-none"
                                placeholder="Tell us more about your inquiry..."
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Send Message
                        </Button>
                    </form>
                </Card>

                {/* Contact Information */}
                <div className="space-y-6">
                    <Card className="p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Get in Touch</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                                    <i className="ri-map-pin-line text-gold-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Address</h4>
                                    <p className="text-slate-400">Ogun Baptist Conference Headquarters<br />Abeokuta, Ogun State, Nigeria</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <i className="ri-phone-line text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Phone</h4>
                                    <p className="text-slate-400">+234 (0) XXX XXX XXXX</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <i className="ri-mail-line text-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Email</h4>
                                    <p className="text-slate-400">info@royalambassadors.org.ng</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Office Hours</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Monday - Friday</span>
                                <span className="text-white">9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Saturday</span>
                                <span className="text-white">10:00 AM - 2:00 PM</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Sunday</span>
                                <span className="text-white">Closed</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact;
