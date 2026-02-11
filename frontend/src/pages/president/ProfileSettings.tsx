import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ProfileSettings: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: 'Pastor',
        lastName: 'Johnson',
        email: 'pastor.johnson@example.com',
        phone: '+234 802 345 6789',
        address: '456 Church Street, Lagos',
        association: 'Ikeja Association',
        position: 'Association President'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating profile:', formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-slate-400">Manage your personal information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-user-line mr-2 text-gold-500" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="firstName" className="block text-slate-300 font-medium mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-slate-300 font-medium mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                        </div>
                    </div>
                </Card>

                {/* Contact Information */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-mail-line mr-2 text-gold-500" />
                        Contact Information
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-slate-300 font-medium mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-slate-300 font-medium mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                            />
                        </div>
                    </div>
                </Card>

                {/* Association & Position */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-map-pin-line mr-2 text-gold-500" />
                        Association & Position
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="association" className="block text-slate-300 font-medium mb-2">
                                Association
                            </label>
                            <input
                                type="text"
                                id="association"
                                name="association"
                                value={formData.association}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-slate-400 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-slate-500 mt-1">Contact admin to change association</p>
                        </div>

                        <div>
                            <label htmlFor="position" className="block text-slate-300 font-medium mb-2">
                                Position
                            </label>
                            <input
                                type="text"
                                id="position"
                                name="position"
                                value={formData.position}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-slate-400 cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit">
                        <i className="ri-save-line mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};
