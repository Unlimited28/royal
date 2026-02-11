import React, { useEffect, useState } from 'react';
import { StatsGrid } from '../../components/ui/StatsGrid';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AmbassadorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/ambassador/stats');
                setStatsData(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { label: 'Current Rank', value: user?.rank || 'Candidate', icon: 'ri-award-line', trend: 'neutral' as const },
        { label: 'Exams Taken', value: statsData?.examsCount?.toString() || '0', icon: 'ri-book-open-line', trend: 'up' as const },
        { label: 'Exams Passed', value: statsData?.examsPassed?.toString() || '0', icon: 'ri-line-chart-line', trend: 'up' as const },
        { label: 'Camp Registrations', value: statsData?.campsCount?.toString() || '0', icon: 'ri-time-line', trend: 'up' as const },
    ];

    if (loading) return <div className="text-white">Loading stats...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {user?.firstName} {user?.lastName}</h1>
                <p className="text-xl text-gold-500 font-medium mt-1">Unique ID: {user?.userCode || 'N/A'}</p>
            </div>

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Examination Portal</h3>
                                <p className="text-slate-400">View available exams and your performance history.</p>
                            </div>
                            <Link to="/ambassador/exams">
                                <Button className="mt-4 md:mt-0">
                                    Go to Exams <i className="ri-arrow-right-s-line ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {statsData?.recentResults?.length > 0 && (
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-4">Recent Exam Results</h3>
                            <div className="space-y-4">
                                {statsData.recentResults.map((result: any) => (
                                    <div key={result._id} className="flex items-center justify-between p-3 bg-navy-900/50 rounded-lg border border-navy-800">
                                        <div>
                                            <div className="text-white font-medium">{result.examId?.title}</div>
                                            <div className="text-xs text-slate-500">{new Date(result.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className={`font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                                            {result.score}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link to="/ambassador/profile" className="p-3 bg-navy-900/50 rounded-lg border border-navy-800 hover:border-gold-500 transition-colors">
                                <i className="ri-user-settings-line mr-2 text-gold-500" />
                                <span className="text-white">Profile Settings</span>
                            </Link>
                            <Link to="/ambassador/notifications" className="p-3 bg-navy-900/50 rounded-lg border border-navy-800 hover:border-gold-500 transition-colors">
                                <i className="ri-notification-3-line mr-2 text-gold-500" />
                                <span className="text-white">Notifications</span>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AmbassadorDashboard;
