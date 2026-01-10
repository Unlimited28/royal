import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ id, className, label, error, options, ...props }, ref) => {
        const selectId = id || props.name;
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label htmlFor={selectId} className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            "w-full bg-primary/50 border border-navy-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all",
                            error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
                            className
                        )}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-primary text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
