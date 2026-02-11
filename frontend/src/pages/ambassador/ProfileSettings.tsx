import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        association: '',
        rank: '',
        userCode: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                address: (user as any).address || '',
                association: (user as any).association?.name || 'N/A',
                rank: user.rank || 'Candidate',
                userCode: user.userCode || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.patch('/users/profile', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email
                // Only these are allowed by the backend DTO
            });
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

                {/* Association & Rank */}
                <Card>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <i className="ri-map-pin-line mr-2 text-gold-500" />
                        Association, Rank & ID
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="ambassadorCode" className="block text-slate-300 font-medium mb-2">
                                Ambassador Code (ID)
                            </label>
                            <input
                                type="text"
                                id="ambassadorCode"
                                name="ambassadorCode"
                                value={formData.userCode}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-gold-500 font-mono font-bold cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-slate-500 mt-1">Your unique lifelong RA identification</p>
                        </div>

                        <div>
                            <label htmlFor="rank" className="block text-slate-300 font-medium mb-2">
                                Current Rank
                            </label>
                            <input
                                type="text"
                                id="rank"
                                name="rank"
                                value={formData.rank}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-slate-400 cursor-not-allowed"
                                disabled
                            />
                            <p className="text-xs text-slate-500 mt-1">Rank is updated after passing exams</p>
                        </div>

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
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit" isLoading={isSaving}>
                        <i className="ri-save-line mr-2" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
