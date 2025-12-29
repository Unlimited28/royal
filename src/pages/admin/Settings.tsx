import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const Settings: React.FC = () => {
    const [settings, setSettings] = useState({
        siteName: 'Royal Ambassadors Portal',
        siteEmail: 'admin@royalambassadors.org',
        enableNotifications: true,
        enableEmailAlerts: true,
        requireEmailVerification: true,
        allowPublicRegistration: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving settings:', settings);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Configure application settings and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Settings */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">General Settings</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="siteName" className="block text-slate-300 font-medium mb-2">
                                Site Name
                            </label>
                            <input
                                type="text"
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="siteEmail" className="block text-slate-300 font-medium mb-2">
                                Site Email
                            </label>
                            <input
                                type="email"
                                id="siteEmail"
                                value={settings.siteEmail}
                                onChange={(e) => handleChange('siteEmail', e.target.value)}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        </div>
                    </div>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-notification-3-line mr-2 text-gold-500" />
                        Notification Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center space-x-3">
                                <i className="ri-notification-3-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Enable Notifications</div>
                                    <div className="text-sm text-slate-400">Receive in-app notifications</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableNotifications}
                                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center space-x-3">
                                <i className="ri-mail-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Email Alerts</div>
                                    <div className="text-sm text-slate-400">Send email notifications for important events</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.enableEmailAlerts}
                                    onChange={(e) => handleChange('enableEmailAlerts', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Security Settings */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-lock-line mr-2 text-gold-500" />
                        Security Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center space-x-3">
                                <i className="ri-mail-check-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Require Email Verification</div>
                                    <div className="text-sm text-slate-400">Users must verify email before accessing system</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.requireEmailVerification}
                                    onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded-lg border border-navy-800">
                            <div className="flex items-center space-x-3">
                                <i className="ri-user-add-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Allow Public Registration</div>
                                    <div className="text-sm text-slate-400">Enable new user registration from public pages</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.allowPublicRegistration}
                                    onChange={(e) => handleChange('allowPublicRegistration', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit">
                        <i className="ri-save-line mr-2" />
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    );
};
