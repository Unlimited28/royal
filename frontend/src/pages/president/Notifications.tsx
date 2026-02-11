import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export const PresidentNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) return <div className="text-white p-8 text-center">Loading notifications...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Notifications</h1>
                    <p className="text-slate-400">View important updates and announcements</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-gold-500/20 rounded-lg border border-gold-500/50">
                        <span className="text-gold-500 font-bold">{unreadCount} Unread</span>
                    </div>
                    <Button variant="outline">
                        Mark All as Read
                    </Button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.map((notification) => (
                    <Card key={notification._id} className={`p-6 ${!notification.isRead ? 'border-gold-500/50' : ''}`}>
                        <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${!notification.isRead
                                    ? 'bg-gold-500/20'
                                    : 'bg-navy-800'
                                }`}>
                                {!notification.isRead ? (
                                    <i className="ri-notification-3-line text-2xl text-gold-500" />
                                ) : (
                                    <i className="ri-check-line text-2xl text-green-500" />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className={`text-lg font-bold ${!notification.isRead ? 'text-white' : 'text-slate-300'
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                                            NEW
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-400 leading-relaxed mb-4">
                                    {notification.message}
                                </p>

                                {!notification.isRead && (
                                    <Button variant="outline" size="sm">
                                        Mark as Read
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {notifications.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="ri-bell-line text-4xl text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
                    <p className="text-slate-400">You're all caught up!</p>
                </Card>
            )}
        </div>
    );
};

export default PresidentNotifications;
