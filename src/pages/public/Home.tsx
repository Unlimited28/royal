import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';

export const Home = () => {
    return (
        <div className="min-h-screen flex flex-col relative z-10 bg-navy-900 text-white">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6 py-20 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight animate-in fade-in zoom-in-95 duration-1000">
                        Royal Ambassadors <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Ogun Baptist Conference</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Empowering young leaders in Christ through faith, fellowship, and service.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        <Link to="/register">
                            <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold">
                                Join as Ambassador
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900">
                                Access Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

             {/* Quick Access Grid */}
            <section className="py-20 bg-navy-900/50 backdrop-blur-sm border-t border-navy-800">
                <div className="max-w-5xl mx-auto px-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <QuickAccessCard
                            icon="ri-image-line"
                            title="Gallery"
                            path="/gallery"
                        />
                        <QuickAccessCard
                            icon="ri-article-line"
                            title="Blog"
                            path="/blog"
                        />
                        <QuickAccessCard
                            icon="ri-information-line"
                            title="About Us"
                            path="/about"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};


const QuickAccessCard = ({ icon, title, path }: { icon: string; title: string; path: string }) => (
    <Link to={path} className="block p-8 rounded-2xl bg-navy-800/50 border border-gold-500/30 backdrop-blur-sm hover:bg-navy-800 hover:-translate-y-1 transition-all duration-300 group text-center">
        <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center mb-6 mx-auto group-hover:bg-gold-500/20 transition-colors">
            <i className={`${icon} text-4xl text-gold-500`} />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
    </Link>
);
