import React, { useState, useCallback } from 'react';
import { ToastContext } from '../../contexts/ToastContext';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getToastStyles = (type: ToastType) => {
        const iconMap = {
            success: 'ri-checkbox-circle-line',
            error: 'ri-close-circle-line',
            warning: 'ri-error-warning-line',
            info: 'ri-information-line',
        };

        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/20',
                    border: 'border-green-500/50',
                    icon: iconMap.success,
                    iconColor: 'text-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-red-500/20',
                    border: 'border-red-500/50',
                    icon: iconMap.error,
                    iconColor: 'text-red-500'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-500/50',
                    icon: iconMap.warning,
                    iconColor: 'text-yellow-500'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500/20',
                    border: 'border-blue-500/50',
                    icon: iconMap.info,
                    iconColor: 'text-blue-500'
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map(toast => {
                    const styles = getToastStyles(toast.type);

                    return (
                        <div
                            key={toast.id}
                            className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 duration-300`}
                        >
                            <div className="flex items-start space-x-3">
                                <i className={`${styles.icon} ${styles.iconColor} text-xl flex-shrink-0 mt-0.5`} />
                                <p className="text-white text-sm flex-1">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <i className="ri-close-line text-lg" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};
