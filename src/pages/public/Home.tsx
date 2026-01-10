import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';

export const Home = () => {
    return (
        <div className="min-h-screen flex flex-col relative z-10 bg-primary text-white">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6 py-20 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight animate-in fade-in zoom-in-95 duration-1000">
                        Royal Ambassadors <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200">Ogun Baptist Conference</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Empowering young leaders in Christ through faith, fellowship, and service.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        <Link to="/register">
                            <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg bg-accent hover:brightness-90 text-primary font-bold">
                                Join as Ambassador
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg border-accent text-accent hover:bg-accent hover:text-primary">
                                Access Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

             {/* Quick Access Grid */}
            <section className="py-20 bg-primary/50 backdrop-blur-sm border-t border-primary-dark">
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
    <Link to={path} className="block p-8 rounded-2xl bg-primary-dark/50 border border-accent/30 backdrop-blur-sm hover:bg-primary-dark hover:-translate-y-1 transition-all duration-300 group text-center">
        <div className="w-16 h-16 rounded-full bg-primary-dark flex items-center justify-center mb-6 mx-auto group-hover:bg-accent/20 transition-colors">
            <i className={`${icon} text-4xl text-accent`} />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
    </Link>
);
