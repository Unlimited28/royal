import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockTransactions } from '../../utils/mockData';

export const FinanceOversight: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = filter === 'all'
        ? mockTransactions
        : mockTransactions.filter(t => t.type === filter);

    const columns = [
        {
            header: 'Date',
            cell: (transaction: typeof mockTransactions[0]) => (
                <span className="text-slate-300">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Type',
            cell: (transaction: typeof mockTransactions[0]) => (
                <div className="flex items-center space-x-2">
                    {transaction.type === 'income' ? (
                        <>
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <i className="ri-arrow-up-line text-green-500" />
                            </div>
                            <span className="text-green-500 font-medium capitalize">{transaction.type}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <i className="ri-arrow-down-line text-red-500" />
                            </div>
                            <span className="text-red-500 font-medium capitalize">{transaction.type}</span>
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Category',
            accessorKey: 'category' as const,
            className: 'text-white font-medium'
        },
        {
            header: 'Description',
            cell: (transaction: typeof mockTransactions[0]) => (
                <div className="max-w-xs">
                    <div className="text-slate-300 text-sm">{transaction.description}</div>
                    {transaction.reference && (
                        <div className="text-xs text-slate-500 mt-1">Ref: {transaction.reference}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Amount',
            cell: (transaction: typeof mockTransactions[0]) => (
                <span className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (transaction: typeof mockTransactions[0]) => {
                const statusColors = {
                    completed: 'bg-green-500/10 text-green-500',
                    pending: 'bg-yellow-500/10 text-yellow-500',
                    failed: 'bg-red-500/10 text-red-500'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
                        {transaction.status.toUpperCase()}
                    </span>
                );
            }
        }
    ];

    const totalIncome = mockTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = mockTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingAmount = mockTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Finance Oversight</h1>
                    <p className="text-slate-400">Detailed transaction history and financial tracking</p>
                </div>
                <Button variant="outline">
                    <i className="ri-download-2-line mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-500">₦{totalIncome.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <i className="ri-arrow-up-line text-2xl text-green-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-500">₦{totalExpense.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <i className="ri-arrow-down-line text-2xl text-red-500" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-500">₦{pendingAmount.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <i className="ri-filter-3-line text-2xl text-yellow-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">All Transactions</h3>
                    <div className="flex items-center space-x-3">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
                            className="px-4 py-2 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income Only</option>
                            <option value="expense">Expense Only</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    data={filteredTransactions}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
