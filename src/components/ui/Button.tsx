import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    ...props
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-gold-500 to-yellow-600 text-navy-900 hover:shadow-lg hover:shadow-gold-500/20 border-0",
        secondary: "bg-navy-700 text-white hover:bg-navy-600 border border-navy-600",
        outline: "bg-transparent border border-gold-500 text-gold-500 hover:bg-gold-500/10",
        ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
        danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs font-medium",
        md: "px-4 py-2 text-sm font-medium",
        lg: "px-6 py-3 text-base font-medium",
    };

    return (
        <button
            className={cn(
                "relative flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <i className="ri-loader-4-line w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
