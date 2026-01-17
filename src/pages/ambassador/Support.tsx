import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AdsSection } from '../../components/ui/AdsSection';

export const Support: React.FC = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Support message:', message);
        setMessage('');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Support</h1>
                <p className="text-slate-400">Get help and assistance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">Contact Support</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="message" className="block text-slate-300 font-medium mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-gold-500"
                                rows={5}
                                placeholder="Describe your issue..."
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Send Message
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 className="text-xl font-bold text-white mb-4">FAQ</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-gold-500 font-semibold">How to take an exam?</h4>
                            <p className="text-slate-300 text-sm">Navigate to the Exams section and select an available exam.</p>
                        </div>
                        <div>
                            <h4 className="text-gold-500 font-semibold">How to update profile?</h4>
                            <p className="text-slate-300 text-sm">Go to Profile Settings to update your information.</p>
                        </div>
                        <div>
                            <h4 className="text-gold-500 font-semibold">Contact Information</h4>
                            <p className="text-slate-300 text-sm">Email: support@royalambassadors.org</p>
                        </div>
                    </div>
                </Card>
            </div>
            <AdsSection placement="Support" />
        </div>
    );
};

export default Support;