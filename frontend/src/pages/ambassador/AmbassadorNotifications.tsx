import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AmbassadorNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/users/me/notifications');
            // Check if it's paginated or direct array
            const data = response.data.data || response.data;
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to update notification');
        }
    };

    if (loading) return <div className="text-white p-8 text-center">Loading notifications...</div>;

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
                                key={notification._id}
                                className={`p-4 rounded-lg border ${
                                    notification.isRead
                                        ? 'bg-navy-800/50 border-navy-700'
                                        : 'bg-gold-500/10 border-gold-500/30'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className={`font-semibold ${notification.isRead ? 'text-white' : 'text-gold-500'}`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-slate-400 mt-1">{notification.message}</p>
                                        <p className="text-xs text-slate-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!notification.isRead && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-4"
                                            onClick={() => handleMarkAsRead(notification._id)}
                                        >
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