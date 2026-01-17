import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockAds as initialMockAds } from '../../utils/mockData';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdsManagement: React.FC = () => {
    const [ads, setAds] = useState(initialMockAds);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAd, setNewAd] = useState({
        business_name: '',
        image_url: '',
        placements: [] as string[]
    });

    const handleApprove = (id: number) => {
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'active' as const } : ad));
        toast.success('Advertisement approved and activated!');
    };

    const handleReject = (id: number) => {
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'rejected' as const } : ad));
        toast.error('Advertisement rejected.');
    };

    const handleCreateAd = (e: React.FormEvent) => {
        e.preventDefault();
        const ad = {
            id: Date.now(),
            business_name: newAd.business_name,
            image_url: newAd.image_url || 'https://via.placeholder.com/600x200?text=Custom+Ad',
            placements: newAd.placements as any[],
            status: 'pending' as const,
            created_at: new Date().toISOString().split('T')[0]
        };
        setAds([ad, ...ads]);
        setIsModalOpen(false);
        setNewAd({ business_name: '', image_url: '', placements: [] });
        toast.success('Ad submission received! Awaiting approval.');
    };

    const togglePlacement = (placement: string) => {
        setNewAd(prev => ({
            ...prev,
            placements: prev.placements.includes(placement)
                ? prev.placements.filter(p => p !== placement)
                : [...prev.placements, placement]
        }));
    };

    const columns = [
        {
            header: 'Business Name',
            cell: (ad: typeof ads[0]) => (
                <div className="font-medium text-white">{ad.business_name}</div>
            )
        },
        {
            header: 'Placements',
            cell: (ad: typeof ads[0]) => (
                <div className="flex flex-wrap gap-1">
                    {ad.placements.map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-navy-700 text-slate-300">
                            {p}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Status',
            cell: (ad: typeof ads[0]) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ad.status === 'active' ? 'bg-green-500/10 text-green-500' :
                    ad.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                }`}>
                    {ad.status.toUpperCase()}
                </span>
            )
        },
        {
            header: 'Date Submitted',
            accessorKey: 'created_at' as const
        },
        {
            header: 'Actions',
            cell: (ad: typeof ads[0]) => (
                <div className="flex items-center space-x-2">
                    {ad.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(ad.id)}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Approve"
                            >
                                <i className="ri-check-line text-green-500" />
                            </button>
                            <button
                                onClick={() => handleReject(ad.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Reject"
                            >
                                <i className="ri-close-line text-red-500" />
                            </button>
                        </>
                    )}
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Delete"
                        onClick={() => setAds(ads.filter(a => a.id !== ad.id))}
                    >
                        <i className="ri-delete-bin-line text-slate-400" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Corporate Ads Management</h1>
                    <p className="text-slate-400">Review business submissions and manage placements</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <i className="ri-add-line mr-2" />
                    Create New Ad
                </Button>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Advertisement Requests</h3>
                </div>

                <DataTable
                    data={ads}
                    columns={columns}
                />
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Advertisement"
            >
                <form onSubmit={handleCreateAd} className="space-y-4 p-4">
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">Business Name *</label>
                        <input
                            type="text"
                            className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                            value={newAd.business_name}
                            onChange={(e) => setNewAd({ ...newAd, business_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">Flyer URL (Simulated Upload) *</label>
                        <input
                            type="url"
                            className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                            value={newAd.image_url}
                            onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-2 text-sm">Placements *</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Index', 'Blog', 'Gallery', 'Support'].map(p => (
                                <label key={p} className="flex items-center space-x-2 cursor-pointer p-2 bg-navy-900/50 rounded hover:bg-navy-800 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={newAd.placements.includes(p)}
                                        onChange={() => togglePlacement(p)}
                                        className="accent-gold-500"
                                    />
                                    <span className="text-slate-300 text-sm">{p}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit for Approval</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdsManagement;
