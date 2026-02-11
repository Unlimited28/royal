import React from 'react';

export const SystemUnavailable: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-navy-950 px-4">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <i className="ri-error-warning-fill text-6xl text-red-500 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Unavailable</h1>
                    <p className="text-slate-400 text-lg">
                        We're sorry, but the Royal Ambassadors Digital Portal is currently unreachable.
                    </p>
                </div>

                <div className="p-4 bg-navy-900/50 border border-navy-800 rounded-xl text-left space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                        <i className="ri-wifi-off-line text-gold-500" />
                        <span>Possible server maintenance or connection issue</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                        <i className="ri-refresh-line text-gold-500" />
                        <span>Please try refreshing the page in a few minutes</span>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-lg transition-all transform active:scale-95 shadow-lg shadow-gold-500/20"
                >
                    Try Reconnecting
                </button>

                <p className="text-xs text-slate-500 italic">
                    If this problem persists, please contact the system administrator.
                </p>
            </div>
        </div>
    );
};

export default SystemUnavailable;
