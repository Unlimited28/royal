import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const CreateAd: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        businessName: '',
        placement: 'Homepage Banner',
        targetAudience: 'All Users',
        targetUrl: '',
        startDate: '',
        endDate: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Persist to localStorage
        const newAd = {
            id: Date.now(),
            ...formData,
            imageUrl: preview, // In a real app, this would be a server URL
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        const existingAds = JSON.parse(localStorage.getItem('ogbc_ads') || '[]');
        localStorage.setItem('ogbc_ads', JSON.stringify([...existingAds, newAd]));

        setTimeout(() => {
            setIsLoading(false);
            navigate('/admin/ads');
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => navigate('/admin/ads')}>
                    <i className="ri-arrow-left-line mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Create Corporate Ad</h1>
                    <p className="text-slate-400">Design and publish a new promotional flyer</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Form Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Ad Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Ad Title</label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Summer Camp 2024"
                                        required
                                        className="bg-navy-800 border-navy-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Business Name</label>
                                    <Input
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleInputChange}
                                        placeholder="e.g., OGBC Ventures"
                                        required
                                        className="bg-navy-800 border-navy-700 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Placement</label>
                                        <select
                                            name="placement"
                                            value={formData.placement}
                                            onChange={handleInputChange}
                                            className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                                        >
                                            <option>Homepage Banner</option>
                                            <option>Sidebar</option>
                                            <option>Footer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                                        <select
                                            name="targetAudience"
                                            value={formData.targetAudience}
                                            onChange={handleInputChange}
                                            className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                                        >
                                            <option>All Users</option>
                                            <option>Ambassadors Only</option>
                                            <option>Presidents Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Target URL (Optional)</label>
                                    <Input
                                        name="targetUrl"
                                        value={formData.targetUrl}
                                        onChange={handleInputChange}
                                        type="url"
                                        placeholder="https://example.com/promo"
                                        className="bg-navy-800 border-navy-700 text-white"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Campaign Duration</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                                    <Input
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        type="date"
                                        required
                                        className="bg-navy-800 border-navy-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                                    <Input
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        type="date"
                                        required
                                        className="bg-navy-800 border-navy-700 text-white"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Flyer Upload & Preview */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Business Flyer</h3>
                            <div className="space-y-4">
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${preview ? 'border-gold-500/50 bg-gold-500/5' : 'border-navy-700 hover:border-gold-500/50'
                                        }`}
                                >
                                    {preview ? (
                                        <div className="relative group">
                                            <img src={preview} alt="Flyer Preview" className="max-w-full h-auto rounded-lg shadow-lg" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => { setPreview(null); }}
                                                    className="text-white border-white hover:bg-white/20"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <i className="ri-image-add-line text-4xl text-slate-500" />
                                            <div>
                                                <p className="text-white font-medium">Upload Flyer</p>
                                                <p className="text-xs text-slate-400 mt-1">JPG, PNG or WEBP (Max 5MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                id="flyer-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => document.getElementById('flyer-upload')?.click()}
                                            >
                                                Select File
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-navy-800/50 rounded-lg border border-navy-700">
                                    <p className="text-xs text-slate-400 flex items-center">
                                        <i className="ri-information-line mr-2 text-blue-400" />
                                        Flyers should be 1080x1080px for best results.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full h-12 text-lg"
                                isLoading={isLoading}
                                disabled={!preview}
                            >
                                Publish Advertisement
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/admin/ads')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateAd;
