import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Navbar } from '../../components/layout/Navbar';


// Mock user for demo purposes
const useAuth = () => {
    const [user, setUser] = useState<{ role: string } | null>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);


    return { user };
};


export const ManageMedia: React.FC = () => {
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'facebook'>('youtube');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const storedBroadcast = localStorage.getItem('ra_live_broadcast');
        if (storedBroadcast) {
            const { url, title, platform } = JSON.parse(storedBroadcast);
            setUrl(url);
            setTitle(title);
            setPlatform(platform);
        }
    }, []);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);


        const broadcastData = {
            url,
            title,
            platform,
        };


        localStorage.setItem('ra_live_broadcast', JSON.stringify(broadcastData));


        setTimeout(() => {
            setIsLoading(false);
            // Optionally, show a success toast
        }, 1000);
    };


    if (user?.role !== 'super_admin') {
        return (
            <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold">Access Denied</h1>
                    <p className="text-slate-400 mt-2">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-navy-900">
            <Navbar />


            <main className="max-w-4xl mx-auto px-6 py-12">
                <Card>
                    <h2 className="text-3xl font-bold text-white mb-2">Manage Live Broadcast</h2>
                    <p className="text-slate-400 mb-8">Update the live stream details for the Media Center.</p>


                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Live Stream URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />


                        <Input
                            label="Broadcast Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter the title of the broadcast"
                            required
                        />


                        <Select
                            label="Platform"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as 'youtube' | 'facebook')}
                            options={[
                                { label: 'YouTube', value: 'youtube' },
                                { label: 'Facebook', value: 'facebook' },
                            ]}
                        />


                        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                            Update Broadcast
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
};
