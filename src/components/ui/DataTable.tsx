import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    isLoading
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-slate-400">
                Loading data...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-slate-400 bg-primary/30 rounded-lg border border-primary-dark">
                No data available
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-primary-dark bg-primary/30">
            <table className="w-full text-left text-sm">
                <thead className="bg-primary-dark border-b border-navy-700">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={cn(
                                    "px-6 py-4 font-semibold text-slate-300 uppercase tracking-wider",
                                    col.className
                                )}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-primary-dark">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick && onRowClick(item)}
                            className={cn(
                                "group transition-colors",
                                onRowClick ? "cursor-pointer hover:bg-primary-dark/50" : "hover:bg-primary-dark/20"
                            )}
                        >
                            {columns.map((col, idx) => (
                                <td key={idx} className="px-6 py-4 whitespace-nowrap text-slate-300 group-hover:text-white transition-colors">
                                    {col.cell
                                        ? col.cell(item)
                                        : col.accessorKey
                                            ? String(item[col.accessorKey])
                                            : null
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
