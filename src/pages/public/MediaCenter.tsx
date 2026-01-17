import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockMedia } from '../../utils/mockData';

const MediaCenter: React.FC = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Center</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Watch our collection of videos and live streams on external platforms.
                </p>
            </section>

            {/* Media Grid */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockMedia.map((item) => (
                        <Card key={item.id} className="p-6 hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex flex-col h-full">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                                    item.type === 'youtube' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                    <i className={`text-3xl ${
                                        item.type === 'youtube' ? 'ri-youtube-line' : 'ri-facebook-box-line'
                                    }`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-xs mb-6">Added on {item.created_at}</p>

                                <div className="mt-auto">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                                        <Button className="w-full" variant={item.type === 'youtube' ? 'default' : 'outline'}>
                                            <i className="ri-external-link-line mr-2" />
                                            Watch on {item.type === 'youtube' ? 'YouTube' : 'Facebook'}
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default MediaCenter;
