import React from 'react';
import { mockAds } from '../../utils/mockData';

interface AdsSectionProps {
    placement: 'Index' | 'Blog' | 'Gallery' | 'Support';
}

export const AdsSection: React.FC<AdsSectionProps> = ({ placement }) => {
    const activeAds = mockAds.filter(ad => ad.status === 'active' && ad.placements.includes(placement));

    if (activeAds.length === 0) return null;

    return (
        <div className="my-8 space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">Sponsored Content</p>
            <div className="flex flex-wrap justify-center gap-4">
                {activeAds.map(ad => (
                    <div key={ad.id} className="relative group overflow-hidden rounded-xl border border-gold-500/20 bg-navy-900/40 transition-all hover:border-gold-500/50 w-full max-w-sm">
                        <img
                            src={ad.image_url}
                            alt={ad.business_name}
                            className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-3 left-3">
                            <span className="px-2 py-0.5 bg-gold-500 text-navy-950 text-[10px] font-bold rounded uppercase">
                                Promoted
                            </span>
                            <h4 className="text-white font-bold text-sm mt-1">{ad.business_name}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
