import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const CampRegistrations: React.FC = () => {
    const [camps, setCamps] = useState<any[]>([]);
    const [selectedCampId, setSelectedCampId] = useState<string>('');
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const response = await api.get('/camps');
                setCamps(response.data);
                if (response.data.length > 0) {
                    setSelectedCampId(response.data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch camps:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCamps();
    }, []);

    useEffect(() => {
        if (selectedCampId) {
            const fetchRegistrations = async () => {
                try {
                    const response = await api.get(`/camps/${selectedCampId}/registrations`);
                    setRegistrations(response.data.map((r: any) => ({ ...r, id: r._id })));
                } catch (error) {
                    console.error('Failed to fetch registrations:', error);
                }
            };
            fetchRegistrations();
        }
    }, [selectedCampId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedCampId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post(`/camps/${selectedCampId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Upload complete: ${response.data.successful} successful, ${response.data.failed} failed.`);
            // Refresh registrations
            const regResponse = await api.get(`/camps/${selectedCampId}/registrations`);
            setRegistrations(regResponse.data.map((r: any) => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload registrations.');
        } finally {
            setUploading(false);
        }
    };

    const columns = [
        {
            header: 'Ambassador',
            cell: (reg: any) => (
                <div>
                    <div className="font-medium text-white">{reg.userId ? `${reg.userId.firstName} ${reg.userId.lastName}` : reg.rawData?.fullName}</div>
                    <div className="text-xs text-slate-400 font-mono">{reg.userId?.userCode || reg.rawData?.userCode || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Church',
            cell: (reg: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                    {reg.rawData?.church || 'N/A'}
                </span>
            )
        },
        {
            header: 'Registration Date',
            cell: (reg: any) => (
                <div className="flex items-center space-x-2 text-slate-300">
                    <i className="ri-calendar-line" />
                    <span>
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }) : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            cell: (reg: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${reg.status === 'APPROVED'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                    {reg.status || 'PENDING'}
                </span>
            )
        },
        {
            header: 'Rank',
            cell: (reg: any) => (
                <span className="text-gold-500 font-bold">{reg.rawData?.rank || 'N/A'}</span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            )
        }
    ];

    const totalRegistrations = registrations.length;
    const approvedCount = registrations.filter(r => r.status === 'APPROVED').length;
    const unmatchedCount = registrations.filter(r => r.unmatched).length;

    const stats = [
        { label: 'Total Registrations', value: totalRegistrations, color: 'gold', icon: 'ri-group-line' },
        { label: 'Approved', value: approvedCount, color: 'green', icon: 'ri-checkbox-circle-line' },
        { label: 'Unmatched', value: unmatchedCount, color: 'yellow', icon: 'ri-error-warning-line' },
        { label: 'Available Camps', value: camps.length, color: 'blue', icon: 'ri-calendar-line' }
    ];

    if (loading) return <div className="text-white p-8 text-center">Loading camp data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Camp Registrations</h1>
                    <p className="text-slate-400">Manage camp registrations for your association</p>
                </div>
                <div className="flex items-center space-x-3">
                    <select
                        className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
                        value={selectedCampId}
                        onChange={(e) => setSelectedCampId(e.target.value)}
                    >
                        {camps.map(camp => (
                            <option key={camp._id} value={camp._id}>{camp.name}</option>
                        ))}
                    </select>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".xlsx"
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <i className="ri-file-excel-line mr-2" />
                        {uploading ? 'Uploading...' : 'Bulk Excel Upload'}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <i className={`${stat.icon} text-xl text-${stat.color}-500`} />
                        </div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Registrations Table */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <i className="ri-group-line mr-2 text-gold-500" />
                        All Registrations
                    </h3>
                </div>

                <DataTable
                    data={registrations}
                    columns={columns}
                />
            </Card>
        </div>
    );
};

export default CampRegistrations;
