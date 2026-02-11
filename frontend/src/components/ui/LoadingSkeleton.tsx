import React from 'react';

interface LoadingSkeletonProps {
    rows?: number;
    className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-navy-700 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-3 bg-navy-700 rounded"></div>
                            <div className="h-3 bg-navy-700 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="animate-pulse space-y-4">
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={`header-${i}`} className="h-4 bg-navy-700 rounded"></div>
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={`cell-${rowIndex}-${colIndex}`} className="h-8 bg-navy-700 rounded"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

interface CardSkeletonProps {
    count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse bg-navy-800 rounded-xl p-6 border border-navy-700">
                    <div className="h-4 bg-navy-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-navy-700 rounded w-3/4"></div>
                </div>
            ))}
        </div>
    );
};
