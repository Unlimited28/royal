import { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';


interface Broadcast {
    url: string;
    title: string;
    platform: 'youtube' | 'facebook';
}


const getEmbedUrl = (url: string, platform: 'youtube' | 'facebook') => {
    if (platform === 'youtube') {
        const videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
            return `https://www.youtube.com/embed/${videoId.substring(0, ampersandPosition)}`;
        }
        return `https://www.youtube.com/embed/${videoId}`;
    }


    if (platform === 'facebook') {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
    }


    return '';
};


export const MediaCenter = () => {
    const [broadcast, setBroadcast] = useState<Broadcast | null>(null);


    useEffect(() => {
        const storedBroadcast = localStorage.getItem('ra_live_broadcast');
        if (storedBroadcast) {
            setBroadcast(JSON.parse(storedBroadcast));
        }
    }, []);


    return (
        <div className="min-h-screen bg-navy-900 text-white">
            <Navbar />


            <main className="max-w-7xl mx-auto px-6 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gold-500">Royal Ambassadors Broadcast Network</h1>
                    <p className="text-slate-400 mt-2">Live Streams & Recent Videos</p>
                </header>


                {/* Live Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-6 border-l-4 border-gold-500 pl-4">Currently Live</h2>
                    {broadcast ? (
                        <div>
                            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-2xl">
                                <iframe
                                    src={getEmbedUrl(broadcast.url, broadcast.platform)}
                                    title={broadcast.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                            <h3 className="text-xl font-bold mt-4">{broadcast.title}</h3>
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-navy-800/50 rounded-lg border border-navy-700">
                            <i className="ri-tv-off-line text-6xl text-slate-500 mb-4"></i>
                            <h3 className="text-2xl font-bold">Offline / No Broadcast</h3>
                            <p className="text-slate-400">Check back later for live events.</p>
                        </div>
                    )}
                </section>


                {/* Video Library */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 border-l-4 border-gold-500 pl-4">Recent Videos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-navy-800/50 rounded-lg overflow-hidden border border-navy-700 group">
                                <div className="aspect-w-16 aspect-h-9 bg-navy-700 flex items-center justify-center">
                                    <i className="ri-play-circle-line text-5xl text-slate-500"></i>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white">Placeholder Video Title {index + 1}</h3>
                                    <p className="text-sm text-slate-400">Lorem ipsum dolor sit amet.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};
