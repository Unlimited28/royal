import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const CreateExam: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rank_required: 'Page',
        duration_minutes: 45,
        pass_score: 60,
        questions_count: 50
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle exam creation
        console.log('Creating exam:', formData);
        navigate('/admin/exams');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration_minutes' || name === 'pass_score' || name === 'questions_count'
                ? Number(value)
                : value
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/admin/exams"
                className="inline-flex items-center text-accent hover:text-gold-400 transition-colors"
            >
                <i className="ri-arrow-left-line mr-2" />
                Back to Exam Management
            </Link>

            <div>
                <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
                <p className="text-slate-400">Set up a new ranking examination</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-slate-300 font-medium mb-2">
                            Exam Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                            placeholder="e.g., Junior Ambassador Promotion Exam"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-slate-300 font-medium mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors resize-none"
                            placeholder="Provide a brief description of this exam"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="rank_required" className="block text-slate-300 font-medium mb-2">
                                Rank Required *
                            </label>
                            <select
                                id="rank_required"
                                name="rank_required"
                                value={formData.rank_required}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                                required
                            >
                                <option value="Page">Page</option>
                                <option value="Squire">Squire</option>
                                <option value="Knight">Knight</option>
                                <option value="Ambassador">Ambassador</option>
                                <option value="Ambassador Plenipotentiary">Ambassador Plenipotentiary</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="duration_minutes" className="block text-slate-300 font-medium mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                id="duration_minutes"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min="15"
                                max="180"
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="pass_score" className="block text-slate-300 font-medium mb-2">
                                Pass Score (%) *
                            </label>
                            <input
                                type="number"
                                id="pass_score"
                                name="pass_score"
                                value={formData.pass_score}
                                onChange={handleChange}
                                min="50"
                                max="100"
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="questions_count" className="block text-slate-300 font-medium mb-2">
                                Number of Questions *
                            </label>
                            <input
                                type="number"
                                id="questions_count"
                                name="questions_count"
                                value={formData.questions_count}
                                onChange={handleChange}
                                min="10"
                                max="200"
                                className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-navy-700">
                        <Link to="/admin/exams">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit">
                            <i className="ri-save-line mr-2" />
                            Create Exam
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
