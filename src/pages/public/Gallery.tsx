
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { mockGalleryItems } from '../../utils/mockData';
import CorporateAds from '../../components/common/CorporateAds';

const Gallery: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(mockGalleryItems.map(item => item.category)))];

    const filteredItems = selectedCategory === 'all'
        ? mockGalleryItems
        : mockGalleryItems.filter(item => item.category === selectedCategory);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Gallery</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Explore memorable moments and events from our Royal Ambassadors community.
                </p>
            </section>

            {/* Category Filter */}
            <section>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                selectedCategory === category
                                    ? 'bg-gold-500 text-navy-900'
                                    : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                            }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Gallery Grid */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                            <div className="aspect-square bg-navy-800 flex items-center justify-center">
                                <i className="ri-image-line text-6xl text-slate-600" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm mb-2">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-1 bg-gold-500/20 text-gold-500 rounded text-xs font-medium">
                                        {item.category}
                                    </span>
                                    <span className="text-slate-500 text-xs">
                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Ad Banner */}
            <section className="py-10 border-y border-navy-800">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-center text-slate-500 uppercase tracking-widest text-xs mb-6 font-bold">Featured Sponsors</h2>
                    <CorporateAds placement="Footer" />
                </div>
            </section>

            {/* Stats */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-gold-500 mb-2">{mockGalleryItems.length}</div>
                        <div className="text-slate-400">Total Photos</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-2">{categories.length - 1}</div>
                        <div className="text-slate-400">Categories</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-green-500 mb-2">
                            {new Date().getFullYear() - 2020}
                        </div>
                        <div className="text-slate-400">Years of Memories</div>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default Gallery;
