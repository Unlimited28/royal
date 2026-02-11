
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface MediaItem {
    _id: string;
    type: 'video' | 'audio';
    title: string;
    description: string;
    url: string;
    duration: string;
    createdAt: string;
}

const ManageMedia: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newMedia, setNewMedia] = useState({
        title: '',
        description: '',
        url: '',
        type: 'video' as 'video' | 'audio',
        duration: ''
    });

    const fetchMedia = async () => {
        try {
            const response = await api.get('/media');
            setMediaItems(response.data);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const handleAddMedia = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/media', newMedia);
            toast.success('Media item added successfully');
            setIsAdding(false);
            setNewMedia({ title: '', description: '', url: '', type: 'video', duration: '' });
            fetchMedia();
        } catch (error) {
            console.error('Failed to add media:', error);
            toast.error('Failed to add media item');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/media/${id}`);
            toast.success('Media item removed');
            fetchMedia();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to remove media item');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Media Management</h1>
                    <p className="text-slate-400">Manage videos and audio recordings in the Media Center</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    <i className={isAdding ? "ri-close-line mr-2" : "ri-add-line mr-2"} />
                    {isAdding ? 'Cancel' : 'Add New Media'}
                </Button>
            </div>

            {isAdding && (
                <Card className="p-6 border-gold-500/30">
                    <form onSubmit={handleAddMedia} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                                <Input
                                    value={newMedia.title}
                                    onChange={e => setNewMedia({...newMedia, title: e.target.value})}
                                    required
                                    placeholder="Media Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                                <select
                                    className="w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2 text-white"
                                    value={newMedia.type}
                                    onChange={e => setNewMedia({...newMedia, type: e.target.value as 'video' | 'audio'})}
                                >
                                    <option value="video">Video (YouTube/Facebook)</option>
                                    <option value="audio">Audio/Podcast</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">External URL</label>
                            <Input
                                value={newMedia.url}
                                onChange={e => setNewMedia({...newMedia, url: e.target.value})}
                                required
                                type="url"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Duration</label>
                                <Input
                                    value={newMedia.duration}
                                    onChange={e => setNewMedia({...newMedia, duration: e.target.value})}
                                    placeholder="e.g., 12:45"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <Input
                                    value={newMedia.description}
                                    onChange={e => setNewMedia({...newMedia, description: e.target.value})}
                                    placeholder="Brief description..."
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Save Media Item</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {mediaItems.map(item => (
                    <Card key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                item.type === 'video' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                            }`}>
                                <i className={item.type === 'video' ? "ri-video-line text-xl" : "ri-music-line text-xl"} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-sm text-slate-400">{item.description}</p>
                                <div className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                                    <span>{item.type.toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{item.duration}</span>
                                    <span>•</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(item.url, '_blank')}>
                                <i className="ri-external-link-line" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => handleDelete(item._id)}>
                                <i className="ri-delete-bin-line" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {mediaItems.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-slate-500">
                        No media items found. Click "Add New Media" to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageMedia;
