import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockMedia as initialMockMedia } from '../../utils/mockData';
import toast from 'react-hot-toast';

const ManageMedia: React.FC = () => {
    const [media, setMedia] = useState(initialMockMedia);
    const [newVideo, setNewVideo] = useState({ title: '', url: '' });

    const handleAddVideo = (e: React.FormEvent) => {
        e.preventDefault();
        const video = {
            id: Date.now(),
            title: newVideo.title,
            url: newVideo.url,
            type: newVideo.url.toLowerCase().includes('facebook.com') ? 'facebook' as const : 'youtube' as const,
            created_at: new Date().toISOString().split('T')[0]
        };
        setMedia([video, ...media]);
        setNewVideo({ title: '', url: '' });
        toast.success('Media content added successfully!');
    };

    const handleDelete = (id: number) => {
        setMedia(media.filter(m => m.id !== id));
        toast.error('Media content removed.');
    };

    const columns = [
        {
            header: 'Video Title',
            accessorKey: 'title' as const,
            className: 'text-white font-medium'
        },
        {
            header: 'Platform',
            cell: (m: typeof media[0]) => (
                <div className="flex items-center space-x-2">
                    <i className={m.type === 'youtube' ? 'ri-youtube-fill text-red-500' : 'ri-facebook-box-fill text-blue-500'} />
                    <span className="capitalize text-slate-300">{m.type}</span>
                </div>
            )
        },
        {
            header: 'URL',
            cell: (m: typeof media[0]) => (
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs block">
                    {m.url}
                </a>
            )
        },
        {
            header: 'Date Added',
            accessorKey: 'created_at' as const
        },
        {
            header: 'Actions',
            cell: (m: typeof media[0]) => (
                <button
                    onClick={() => handleDelete(m.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <i className="ri-delete-bin-line text-red-500" />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Media Center Management</h1>
                <p className="text-slate-400">Add or remove external video links (YouTube/Facebook)</p>
            </div>

            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Add New Video</h3>
                <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">Video Title</label>
                        <input
                            type="text"
                            className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                            value={newVideo.title}
                            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 mb-1 text-sm">External URL</label>
                        <input
                            type="url"
                            className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                            value={newVideo.url}
                            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                            placeholder="https://youtube.com/... or facebook.com/..."
                            required
                        />
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" className="w-full">
                            <i className="ri-add-line mr-2" />
                            Add Video
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Existing Media</h3>
                <DataTable
                    data={media}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default ManageMedia;
