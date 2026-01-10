import React from 'react';
import { mockGalleryItems } from '../utils/mockData';
import { PublicNavbar } from '../components/layout/PublicNavbar';

export const Gallery: React.FC = () => {
    return (
        <div className="min-h-screen bg-navy-950">
            <PublicNavbar />

            {/* Page Header */}
            <header className="pt-32 pb-16 text-center bg-gradient-to-b from-primary/50 to-transparent">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
                        Our Gallery
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        A glimpse into our events, camps, and community activities.
                    </p>
                </div>
            </header>

            {/* Gallery Grid */}
            <main className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockGalleryItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-gradient-to-br from-primary/50 to-primary-dark/30 border border-navy-700 rounded-2xl overflow-hidden hover:border-accent/50 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl"
                            >
                                {/* Image Placeholder */}
                                <div className="h-64 bg-gradient-to-br from-primary-dark to-navy-700 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
                                    <div className="relative z-10 text-center">
                                        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <i className="ri-image-line text-3xl text-accent" />
                                        </div>
                                        <p className="text-slate-500 text-sm">{item.category}</p>
                                    </div>
                                </div>

                                {/* Caption Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-950 via-navy-950/95 to-transparent">
                                    <h4 className="text-white font-bold text-lg mb-1">
                                        {item.title}
                                    </h4>
                                    <p className="text-slate-400 text-sm">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-navy-950 to-primary border-t border-primary-dark py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-600 rounded-lg flex items-center justify-center">
                            <span className="text-navy-950 font-bold text-xl">RA</span>
                        </div>
                        <span className="text-xl font-bold text-white">Royal Ambassadors - Ogun Baptist Conference</span>
                    </div>
                    <p className="text-slate-400 mb-6">
                        Empowering young Christian leaders across Ogun State through faith, education, and service.
                    </p>
                    <div className="border-t border-primary-dark pt-6">
                        <p className="text-slate-500 text-sm">
                            © 2025 Royal Ambassadors Ogun Baptist Conference. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
