import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, noPadding = false, ...props }) => {
    return (
        <div
            className={cn(
                "bg-card-bg backdrop-blur-sm border border-navy-800 rounded-xl shadow-lg animate-gold-pulse transition-all duration-300",
                noPadding ? "p-0" : "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
