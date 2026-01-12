
import React from 'react';
import { Card } from '../../components/ui/Card';

const About: React.FC = () => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <section className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    About <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Royal Ambassadors</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Empowering young leaders in Christ through faith, fellowship, and service in the Ogun Baptist Conference.
                </p>
            </section>

            {/* Mission & Vision */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8">
                    <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mb-6">
                        <i className="ri-compass-3-line text-3xl text-gold-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                    <p className="text-slate-400 leading-relaxed">
                        To develop godly young leaders who will impact their communities and the world for Christ through
                        comprehensive training, mentorship, and service opportunities.
                    </p>
                </Card>

                <Card className="p-8">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                        <i className="ri-eye-line text-3xl text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                    <p className="text-slate-400 leading-relaxed">
                        A generation of Royal Ambassadors who are spiritually mature, academically excellent,
                        and socially responsible, serving as ambassadors for Christ in all spheres of life.
                    </p>
                </Card>
            </section>

            {/* Core Values */}
            <section>
                <h2 className="text-3xl font-bold text-white text-center mb-12">Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 text-center">
                        <i className="ri-heart-line text-4xl text-red-500 mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Faith</h4>
                        <p className="text-slate-400">Deep commitment to Christ and biblical principles</p>
                    </Card>

                    <Card className="p-6 text-center">
                        <i className="ri-team-line text-4xl text-green-500 mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Fellowship</h4>
                        <p className="text-slate-400">Building strong relationships and community</p>
                    </Card>

                    <Card className="p-6 text-center">
                        <i className="ri-service-line text-4xl text-blue-500 mb-4" />
                        <h4 className="text-xl font-bold text-white mb-2">Service</h4>
                        <p className="text-slate-400">Serving God and community with excellence</p>
                    </Card>
                </div>
            </section>

            {/* Leadership Structure */}
            <section>
                <h2 className="text-3xl font-bold text-white text-center mb-12">Leadership Structure</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center mb-6 mx-auto">
                            <i className="ri-crown-line text-3xl text-gold-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Super Admin</h4>
                        <p className="text-slate-400">Oversees system-wide operations and strategic direction</p>
                    </Card>

                    <Card className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center mb-6 mx-auto">
                            <i className="ri-building-line text-3xl text-blue-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Association Presidents</h4>
                        <p className="text-slate-400">Lead local associations and coordinate regional activities</p>
                    </Card>

                    <Card className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-navy-700 flex items-center justify-center mb-6 mx-auto">
                            <i className="ri-user-star-line text-3xl text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Ambassadors</h4>
                        <p className="text-slate-400">Active members participating in programs and service</p>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default About;
