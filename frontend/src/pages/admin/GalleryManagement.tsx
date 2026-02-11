import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';

const GalleryManagement: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await api.get('/gallery');
                setItems(response.data.map((i: any) => ({ ...i, id: i._id })));
            } catch (error) {
                console.error('Failed to fetch gallery:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const columns = [
        {
            header: 'Image',
            cell: (item: any) => (
                <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-navy-800 to-navy-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <i className="ri-image-line text-2xl text-gold-500" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.category}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Description',
            cell: (item: any) => (
                <div className="max-w-md">
                    <p className="text-slate-300 text-sm">{item.description}</p>
                </div>
            )
        },
        {
            header: 'Uploaded',
            cell: (item: any) => (
                <span className="text-slate-300">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Status',
            cell: () => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    PUBLISHED
                </span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Edit Item"
                    >
                        <i className="ri-pencil-line text-gold-500" />
                    </button>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Delete Item"
                    >
                        <i className="ri-delete-bin-line text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Total Images', value: items.length, color: 'gold' },
        { label: 'Published', value: items.length, color: 'green' },
        { label: 'Categories', value: Array.from(new Set(items.map(i => i.category))).length, color: 'blue' },
        { label: 'Updates', value: items.length, color: 'purple' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gallery Management</h1>
                    <p className="text-slate-400">Manage gallery images and albums</p>
                </div>
                <Button>
                    <i className="ri-upload-2-line mr-2" />
                    Upload Images
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Gallery Items Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">All Gallery Items</h3>
                </div>

                <DataTable
                    data={items}
                    columns={columns}
                    isLoading={loading}
                />
            </Card>
        </div>
    );
};

export default GalleryManagement;
