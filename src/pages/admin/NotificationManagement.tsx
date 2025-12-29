import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const NotificationManagement: React.FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target: 'all',
        priority: 'normal'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Sending notification:', formData);
        setFormData({ title: '', message: '', target: 'all', priority: 'normal' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const stats = [
        { label: 'Total Sent', value: '156', color: 'gold', icon: 'ri-notification-3-line' },
        { label: 'This Week', value: '12', color: 'blue', icon: 'ri-send-plane-line' },
        { label: 'Recipients', value: '245', color: 'green', icon: 'ri-group-line' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Notification Management</h1>
                <p className="text-slate-400">Create and send notifications to users</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                                <p className={`text-3xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center`}>
                                <i className={`${stat.icon} text-2xl text-${stat.color}-500`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Notification Form */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <i className="ri-add-line mr-2 text-gold-500" />
                    Create New Notification
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-slate-300 font-medium mb-2">
                                Notification Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                placeholder="Enter notification title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="target" className="block text-slate-300 font-medium mb-2">
                                Target Audience *
                            </label>
                            <select
                                id="target"
                                name="target"
                                value={formData.target}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                                required
                            >
                                <option value="all">All Users</option>
                                <option value="ambassadors">Ambassadors Only</option>
                                <option value="presidents">Association Presidents</option>
                                <option value="admins">Administrators</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="priority" className="block text-slate-300 font-medium mb-2">
                            Priority Level
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500"
                        >
                            <option value="low">Low Priority</option>
                            <option value="normal">Normal Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-slate-300 font-medium mb-2">
                            Message *
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none"
                            placeholder="Enter notification message..."
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4 border-t border-navy-700">
                        <Button variant="outline" type="button">
                            Save as Draft
                        </Button>
                        <Button type="submit">
                            <i className="ri-send-plane-line mr-2" />
                            Send Notification
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
