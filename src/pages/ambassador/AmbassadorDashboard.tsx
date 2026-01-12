import React from 'react';
import { StatsGrid } from '../../components/ui/StatsGrid';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const AmbassadorDashboard: React.FC = () => {
    const stats = [
        { label: 'Current Rank', value: 'Special Envoy', icon: 'ri-award-line', trend: 'neutral' as const },
        { label: 'Next Exam', value: 'Senior Envoy', icon: 'ri-book-open-line', change: '10 days left', trend: 'up' as const },
        { label: 'Exam Score', value: '85%', icon: 'ri-line-chart-line', change: 'Last Exam', trend: 'up' as const },
        { label: 'Active Days', value: '124', icon: 'ri-time-line', trend: 'up' as const },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                <p className="text-slate-400">Welcome back, Samuel. Continue your journey to Knighthood.</p>
            </div>

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Next Step / Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Next Milestone: Senior Envoy</h3>
                                <p className="text-slate-400">You are eligible for the next promotion exam.</p>
                            </div>
                            <Link to="/ambassador/exams">
                                <Button className="mt-4 md:mt-0">
                                    Take Exam Now <i className="ri-arrow-right-s-line ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Progress to Knighthood</span>
                                <span className="text-gold-500 font-bold">80%</span>
                            </div>
                            <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-gold-500 to-yellow-300 w-[80%] rounded-full relative">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Complete 2 more study modules to unlock the exam.</p>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-navy-900/50 rounded-lg border border-navy-800">
                                <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                                    <i className="ri-award-line text-xl" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Special Envoy Badge</div>
                                    <div className="text-xs text-slate-500">Earned 2 months ago</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-navy-900/50 rounded-lg border border-navy-800">
                                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                                    <i className="ri-book-open-line text-xl" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Bible Study 101</div>
                                    <div className="text-xs text-slate-500">Completed</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Notifications / Sidebar Widgets */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-white mb-4">Notice Board</h3>
                        <ul className="space-y-4">
                            <li className="text-sm text-slate-300 border-l-2 border-gold-500 pl-3">
                                <div className="font-medium text-white">Monthly Meeting</div>
                                <div className="text-xs text-slate-500 mt-1">Next Sunday @ 4 PM</div>
                            </li>
                            <li className="text-sm text-slate-300 border-l-2 border-navy-600 pl-3">
                                <div className="font-medium text-white">Uniform Inspection</div>
                                <div className="text-xs text-slate-500 mt-1">Prepare your ceremonial gear</div>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AmbassadorDashboard;
