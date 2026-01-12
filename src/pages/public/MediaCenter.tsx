
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const MediaCenter: React.FC = () => {
    const mediaItems = [
        {
            id: 1,
            type: 'video',
            title: 'Annual Camp 2024 Highlights',
            description: 'A recap of our transformative annual camp experience',
            duration: '15:30',
            date: '2024-08-15'
        },
        {
            id: 2,
            type: 'audio',
            title: 'Leadership Summit Recording',
            description: 'Keynote address on developing godly leadership',
            duration: '45:20',
            date: '2024-07-22'
        },
        {
            id: 3,
            type: 'video',
            title: 'Community Service Project',
            description: 'Documentary of our recent outreach program',
            duration: '22:15',
            date: '2024-06-10'
        },
        {
            id: 4,
            type: 'audio',
            title: 'Monthly Devotional',
            description: 'June devotional on faith and perseverance',
            duration: '28:45',
            date: '2024-06-01'
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Center</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Access our collection of videos, audio recordings, and multimedia content.
                </p>
            </section>

            {/* Media Grid */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mediaItems.map((item) => (
                        <Card key={item.id} className="p-6 hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start space-x-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    item.type === 'video' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                    <i className={`text-2xl ${
                                        item.type === 'video' ? 'ri-video-line' : 'ri-music-line'
                                    }`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                                            <span>{item.duration}</span>
                                            <span>{new Date(item.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            <i className="ri-play-line mr-2" />
                                            Play
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 mx-auto">
                            <i className="ri-video-line text-3xl text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Videos</h3>
                        <p className="text-slate-400">Event highlights, testimonials, and teachings</p>
                    </Card>

                    <Card className="p-6 text-center hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 mx-auto">
                            <i className="ri-music-line text-3xl text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Audio</h3>
                        <p className="text-slate-400">Devotionals, sermons, and worship sessions</p>
                    </Card>

                    <Card className="p-6 text-center hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
                            <i className="ri-file-text-line text-3xl text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Resources</h3>
                        <p className="text-slate-400">Study guides, manuals, and training materials</p>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default MediaCenter;
