import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockVouchers } from '../../utils/mockData';

type FilterStatus = 'all' | 'active' | 'used' | 'expired';

const isFilterStatus = (value: string): value is FilterStatus => {
    return ['all', 'active', 'used', 'expired'].includes(value);
};

export const VoucherManagement: React.FC = () => {
    const [filter, setFilter] = useState<FilterStatus>('all');

    const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (isFilterStatus(value)) {
            setFilter(value);
        }
    };

    const filteredVouchers = filter === 'all'
        ? mockVouchers
        : mockVouchers.filter(v => v.status === filter);

    const columns = [
        {
            header: 'Voucher Code',
            cell: (voucher: typeof mockVouchers[0]) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <i className="ri-coupon-3-line text-accent" />
                    </div>
                    <div>
                        <div className="font-mono font-medium text-white">{voucher.code}</div>
                        <div className="text-xs text-slate-400 capitalize">{voucher.type} Voucher</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            cell: (voucher: typeof mockVouchers[0]) => (
                <span className="text-green-500 font-bold">₦{voucher.amount.toLocaleString()}</span>
            )
        },
        {
            header: 'Status',
            cell: (voucher: typeof mockVouchers[0]) => {
                const statusColors = {
                    active: 'bg-green-500/10 text-green-500',
                    used: 'bg-blue-500/10 text-blue-500',
                    expired: 'bg-red-500/10 text-red-500'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[voucher.status]}`}>
                        {voucher.status.toUpperCase()}
                    </span>
                );
            }
        },
        {
            header: 'Created',
            cell: (voucher: typeof mockVouchers[0]) => (
                <span className="text-slate-300">
                    {new Date(voucher.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Used By',
            cell: (voucher: typeof mockVouchers[0]) => (
                <div>
                    {voucher.used_by ? (
                        <>
                            <div className="text-white text-sm">{voucher.used_by}</div>
                            <div className="text-xs text-slate-400">
                                {voucher.used_at && new Date(voucher.used_at).toLocaleDateString()}
                            </div>
                        </>
                    ) : (
                        <span className="text-slate-500 text-sm">—</span>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            cell: (voucher: typeof mockVouchers[0]) => (
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Copy Code"
                    >
                        <i className="ri-file-copy-line text-blue-500" />
                    </button>
                    {voucher.status === 'active' && (
                        <button
                            className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                            title="Delete Voucher"
                        >
                            <i className="ri-delete-bin-line text-red-500" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const stats = [
        {
            label: 'Total Vouchers',
            value: mockVouchers.length,
            color: 'gold'
        },
        {
            label: 'Active',
            value: mockVouchers.filter(v => v.status === 'active').length,
            color: 'green'
        },
        {
            label: 'Used',
            value: mockVouchers.filter(v => v.status === 'used').length,
            color: 'blue'
        },
        {
            label: 'Expired',
            value: mockVouchers.filter(v => v.status === 'expired').length,
            color: 'red'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Voucher Management</h1>
                    <p className="text-slate-400">Create and manage payment vouchers</p>
                </div>
                <Button>
                    <i className="ri-add-line mr-2" />
                    Generate Vouchers
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Vouchers Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-coupon-3-line mr-2 text-accent" />
                        All Vouchers
                    </h3>
                    <div className="flex items-center space-x-3">
                        <select
                            value={filter}
                            onChange={handleFilterChange}
                            className="px-4 py-2 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="used">Used</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    data={filteredVouchers}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
