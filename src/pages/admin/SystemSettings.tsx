import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SystemSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        debugMode: false,
        cacheEnabled: true,
        autoBackup: true,
        backupFrequency: 'daily',
        maxUploadSize: '10',
        sessionTimeout: '30'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving system settings:', settings);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">System Settings</h1>
                <p className="text-slate-400">Advanced system configuration and maintenance options</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* System Status */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-server-line mr-2 text-accent" />
                        System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center space-x-3">
                                <i className="ri-shield-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Maintenance Mode</div>
                                    <div className="text-sm text-slate-400">Disable public access for maintenance</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.maintenanceMode}
                                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center space-x-3">
                                <i className="ri-flashlight-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Debug Mode</div>
                                    <div className="text-sm text-slate-400">Enable detailed error logging</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.debugMode}
                                    onChange={(e) => handleChange('debugMode', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center space-x-3">
                                <i className="ri-database-2-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Cache Enabled</div>
                                    <div className="text-sm text-slate-400">Enable application caching for better performance</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.cacheEnabled}
                                    onChange={(e) => handleChange('cacheEnabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Backup Settings */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-database-2-line mr-2 text-accent" />
                        Backup Settings
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-primary/50 rounded-lg border border-primary-dark">
                            <div className="flex items-center space-x-3">
                                <i className="ri-database-2-line text-slate-400" />
                                <div>
                                    <div className="text-white font-medium">Automatic Backup</div>
                                    <div className="text-sm text-slate-400">Enable scheduled database backups</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoBackup}
                                    onChange={(e) => handleChange('autoBackup', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-navy-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>

                        <div>
                            <label htmlFor="backupFrequency" className="block text-slate-300 font-medium mb-2">
                                Backup Frequency
                            </label>
                            <select
                                id="backupFrequency"
                                value={settings.backupFrequency}
                                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                                disabled={!settings.autoBackup}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Performance Settings */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6">Performance Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="maxUploadSize" className="block text-slate-300 font-medium mb-2">
                                Max Upload Size (MB)
                            </label>
                            <input
                                type="number"
                                id="maxUploadSize"
                                value={settings.maxUploadSize}
                                onChange={(e) => handleChange('maxUploadSize', e.target.value)}
                                min="1"
                                max="100"
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label htmlFor="sessionTimeout" className="block text-slate-300 font-medium mb-2">
                                Session Timeout (minutes)
                            </label>
                            <input
                                type="number"
                                id="sessionTimeout"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                min="5"
                                max="120"
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button">
                        Reset to Defaults
                    </Button>
                    <Button type="submit">
                        <i className="ri-save-line mr-2" />
                        Save System Settings
                    </Button>
                </div>
            </form>
        </div>
    );
};
