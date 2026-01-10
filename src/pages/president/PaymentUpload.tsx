import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PaymentUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            console.log('Uploading file:', selectedFile.name);
            setSelectedFile(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white">Payments Upload</h1>
                <p className="text-slate-400">Upload payment records for your association</p>
            </div>

            {/* Upload Card */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Upload Payment File</h3>

                <div className="space-y-6">
                    <div className="border-2 border-dashed border-navy-700 rounded-lg p-12 text-center hover:border-accent transition-colors">
                        <i className="ri-file-excel-2-line text-6xl text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-300 mb-2">
                            {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-slate-500 mb-4">Excel (.xlsx, .xls) or CSV files only</p>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outline">
                                <i className="ri-upload-cloud-2-line mr-2" />
                                Choose File
                            </Button>
                        </label>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <i className="ri-checkbox-circle-line text-xl text-green-500" />
                                <div>
                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <Button onClick={handleUpload}>
                                <i className="ri-upload-cloud-2-line mr-2" />
                                Upload
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-500/10 border-blue-500/50">
                <h3 className="text-lg font-bold text-white mb-3">📋 Upload Instructions</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                    <li>• File must be in Excel (.xlsx, .xls) or CSV format</li>
                    <li>• Include columns: Ambassador Code, Amount, Payment Date, Reference</li>
                    <li>• Maximum file size: 5MB</li>
                    <li>• Ensure all ambassador codes are valid</li>
                    <li>• Payment dates should be in YYYY-MM-DD format</li>
                </ul>
            </Card>

            {/* Sample Template */}
            <Card>
                <h3 className="text-lg font-bold text-white mb-3">Download Sample Template</h3>
                <p className="text-slate-400 text-sm mb-4">
                    Use our template to ensure your payment file is formatted correctly
                </p>
                <Button variant="outline">
                    <i className="ri-file-excel-2-line mr-2" />
                    Download Template
                </Button>
            </Card>
        </div>
    );
};
