import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Ad {
    _id: string;
    title: string;
    businessName: string;
    imageUrl: string;
    targetUrl?: string;
    placement: string;
}

interface CorporateAdsProps {
    placement?: 'Homepage Banner' | 'Sidebar' | 'Footer';
    className?: string;
}

const CorporateAds: React.FC<CorporateAdsProps> = ({ placement, className = "" }) => {
    const [ads, setAds] = useState<Ad[]>([]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await api.get('/ads/active');
                let data = response.data;
                if (placement) {
                    data = data.filter((ad: Ad) => ad.placement === placement);
                }
                setAds(data);
            } catch (error) {
                console.error('Failed to fetch active ads:', error);
            }
        };
        fetchAds();
    }, [placement]);

    if (ads.length === 0) return null;

    return (
        <div className={`corporate-ads ${className}`}>
            {ads.map(ad => (
                <div key={ad._id} className="mb-6 last:mb-0">
                    <a
                        href={ad.targetUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group relative overflow-hidden rounded-xl border border-navy-700 bg-navy-800/50 transition-all hover:border-gold-500/50"
                    >
                        <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/90 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                            <p className="text-xs text-gold-500 font-medium">{ad.businessName}</p>
                            <p className="text-sm text-white font-bold">{ad.title}</p>
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
};

export default CorporateAds;
