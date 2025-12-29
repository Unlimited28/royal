import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { mockCampFiles } from '../../utils/mockData';

export const CampFiles: React.FC = () => {
    const columns = [
        {
            header: 'Association',
            cell: (file: typeof mockCampFiles[0]) => (
                <div>
                    <div className="font-medium text-white">{file.association}</div>
                    <div className="text-xs text-slate-400">Uploaded by {file.uploaded_by}</div>
                </div>
            )
        },
        {
            header: 'File Name',
            cell: (file: typeof mockCampFiles[0]) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <i className="ri-file-excel-2-line text-green-500" />
                    </div>
                    <div>
                        <div className="text-white font-mono text-sm">{file.file_name}</div>
                        <div className="text-xs text-slate-400">{file.file_size}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Registered Count',
            cell: (file: typeof mockCampFiles[0]) => (
                <span className="text-gold-500 font-bold">{file.registered_count}</span>
            )
        },
        {
            header: 'Upload Date',
            cell: (file: typeof mockCampFiles[0]) => (
                <span className="text-slate-300">
                    {new Date(file.upload_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Status',
            cell: (file: typeof mockCampFiles[0]) => {
                const statusConfig = {
                    approved: { icon: 'ri-checkbox-circle-line', color: 'green', label: 'APPROVED' },
                    pending: { icon: 'ri-time-line', color: 'yellow', label: 'PENDING' },
                    rejected: { icon: 'ri-close-circle-line', color: 'red', label: 'REJECTED' }
                };
                const config = statusConfig[file.status];

                return (
                    <div className="flex items-center space-x-2">
                        <i className={`${config.icon} text-${config.color}-500`} />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-500/10 text-${config.color}-500`}>
                            {config.label}
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                        <i className="ri-download-2-line mr-1" />
                        Download
                    </Button>
                </div>
            )
        }
    ];

    const stats = [
        {
            label: 'Total Files',
            value: mockCampFiles.length,
            color: 'gold'
        },
        {
            label: 'Approved',
            value: mockCampFiles.filter(f => f.status === 'approved').length,
            color: 'green'
        },
        {
            label: 'Pending Review',
            value: mockCampFiles.filter(f => f.status === 'pending').length,
            color: 'yellow'
        },
        {
            label: 'Total Registered',
            value: mockCampFiles.reduce((sum, f) => sum + f.registered_count, 0),
            color: 'blue'
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Camp Files Management</h1>
                <p className="text-slate-400">Review and approve camp registration files from associations</p>
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

            {/* Files Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-file-excel-2-line mr-2 text-gold-500" />
                        Uploaded Files
                    </h3>
                </div>

                <DataTable
                    data={mockCampFiles}
                    columns={columns}
                />
            </Card>
        </div>
    );
};
