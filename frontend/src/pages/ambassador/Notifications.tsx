import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Notifications: React.FC = () => {
    // Placeholder for notifications data
    const notifications = [
        {
            id: 1,
            title: 'Exam Reminder',
            message: 'Your next exam is scheduled for tomorrow.',
            date: '2026-01-13',
            read: false
        },
        {
            id: 2,
            title: 'Profile Update',
            message: 'Your profile has been updated successfully.',
            date: '2026-01-12',
            read: true
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-slate-400">Stay updated with your latest activities</p>
            </div>

            <Card>
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'border-navy-700 bg-navy-800/50' : 'border-gold-500 bg-gold-500/10'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-white font-semibold">{notification.title}</h4>
                                        <p className="text-slate-300 text-sm">{notification.message}</p>
                                        <p className="text-slate-500 text-xs mt-1">{notification.date}</p>
                                    </div>
                                    {!notification.read && (
                                        <Button size="sm" variant="outline" className="text-xs">
                                            Mark as Read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <i className="ri-notification-line text-4xl text-slate-500 mb-4" />
                            <p className="text-slate-400">No notifications yet</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Notifications;