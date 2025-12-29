import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Button } from '../components/ui/Button';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col relative z-10">
            {/* Navbar for Landing */}
            <header className="h-20 px-6 flex items-center justify-between sticky top-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-navy-800">
                <div className="flex items-center space-x-3">
                    <img
                        src={logo}
                        alt="Royal Ambassadors Logo"
                        className="w-12 h-12 object-contain"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-white leading-none">Royal Ambassadors</h1>
                        <span className="text-xs text-gold-500 font-medium tracking-wider">OGUN BAPTIST CONFERENCE</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="primary">Join Us</Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center px-6 py-20 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-navy-800/50 rounded-full border border-navy-700 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-slate-300">Registration for Camp 2024 is now open!</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight animate-in fade-in zoom-in-95 duration-1000">
                        Royal Ambassadors <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Ogun Baptist Conference</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        Empowering young leaders in Christ through faith, fellowship, and service across 25 associations. Join our community of dedicated ambassadors committed to spiritual growth and excellence through our 11-level advancement system.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        <Link to="/login">
                            <Button size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                                Access Portal
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg">
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-navy-900/50 backdrop-blur-sm border-t border-navy-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">What We Offer</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Comprehensive programs designed to nurture spiritual growth and leadership development across all 25 OGBC associations
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="ri-award-line"
                            title="11-Level Rank Advancement"
                            description="Progress through our comprehensive 11-level system, from Candidate to Ambassador Plenipotentiary, through dedicated study and service across all 25 associations."
                        />
                        <FeatureCard
                            icon="ri-macbook-line"
                            title="Online Examinations"
                            description="Take comprehensive online exams to test your knowledge and advance to the next rank in your Royal Ambassador journey with secure, timed assessments."
                        />
                        <FeatureCard
                            icon="ri-tent-line"
                            title="Camp Registration"
                            description="Register for exciting camps and events designed to strengthen fellowship and deepen your faith journey with ambassadors from all associations."
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-t border-navy-800 bg-navy-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatItem value="11" label="Advancement Ranks" />
                        <StatItem value="25" label="Baptist Associations" />
                        <StatItem value="1000+" label="Active Members" />
                        <StatItem value="25+" label="Years of Service" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-navy-800 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Royal Ambassadors Ogun Baptist Conference. All rights reserved.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="p-8 rounded-2xl bg-navy-800/50 border border-navy-700 hover:border-gold-500/50 hover:bg-navy-800 hover:-translate-y-1 transition-all duration-300 group">
        <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center mb-6 group-hover:bg-gold-500/20 group-hover:text-gold-500 transition-colors">
            <i className={`text-3xl text-slate-300 group-hover:text-gold-500 ${icon}`} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
    <div className="p-4">
        <div className="text-4xl font-bold text-gold-500 mb-2">{value}</div>
        <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
);
