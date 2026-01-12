import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AmbassadorNotifications: React.FC = () => {
    // Mock notifications data
    const notifications = [
        {
            id: 1,
            title: 'Exam Promotion Available',
            message: 'You are now eligible for Senior Envoy exam. Prepare and apply.',
            date: '2026-01-10',
            read: false,
        },
        {
            id: 2,
            title: 'Camp Registration Open',
            message: 'Annual camp registration is now open. Register before deadline.',
            date: '2026-01-08',
            read: true,
        },
        {
            id: 3,
            title: 'Payment Reminder',
            message: 'Your membership fee payment is due. Please complete payment.',
            date: '2026-01-05',
            read: true,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-slate-400">Stay updated with important announcements and reminders.</p>
            </div>

            <Card>
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border ${
                                    notification.read
                                        ? 'bg-navy-800/50 border-navy-700'
                                        : 'bg-gold-500/10 border-gold-500/30'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className={`font-semibold ${notification.read ? 'text-white' : 'text-gold-500'}`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-slate-400 mt-1">{notification.message}</p>
                                        <p className="text-xs text-slate-500 mt-2">{notification.date}</p>
                                    </div>
                                    {!notification.read && (
                                        <Button size="sm" variant="outline" className="ml-4">
                                            Mark as Read
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <i className="ri-notification-line text-4xl text-slate-500 mb-4"></i>
                            <p className="text-slate-400">No notifications at this time.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AmbassadorNotifications;