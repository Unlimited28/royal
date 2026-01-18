import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RANK_HIERARCHY_LIST } from '../../utils/logic';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
}

const CreateExam: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetRank: RANK_HIERARCHY_LIST[1], // Default to Page (next after Candidate)
        duration_minutes: 45,
        pass_score: 60,
    });

    const [questions, setQuestions] = useState<Question[]>([
        { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle exam creation
        const examData = {
            ...formData,
            questions,
            totalQuestions: questions.length
        };
        console.log('Creating exam:', examData);
        // Simulate saving
        const existingExams = JSON.parse(localStorage.getItem('ogbc_exams') || '[]');
        localStorage.setItem('ogbc_exams', JSON.stringify([...existingExams, { ...examData, id: Date.now(), status: 'Published' }]));

        navigate('/admin/exams');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duration_minutes' || name === 'pass_score'
                ? Number(value)
                : value
        }));
    };

    const addQuestion = () => {
        setQuestions(prev => [
            ...prev,
            { id: Date.now(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]);
    };

    const removeQuestion = (id: number) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
    };

    const updateQuestion = (id: number, field: string, value: any) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === id) {
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const updateOption = (qId: number, optIdx: number, value: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIdx] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <Link
                to="/admin/exams"
                className="inline-flex items-center text-gold-500 hover:text-gold-400 transition-colors"
            >
                <i className="ri-arrow-left-line mr-2" />
                Back to Exam Management
            </Link>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
                    <p className="text-slate-400">Set up a new ranking examination</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card title="Exam Details">
                    <div className="space-y-6">
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
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
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
                                rows={3}
                                className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors resize-none"
                                placeholder="Provide a brief description of this exam"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="targetRank" className="block text-slate-300 font-medium mb-2">
                                    Target Rank *
                                </label>
                                <select
                                    id="targetRank"
                                    name="targetRank"
                                    value={formData.targetRank}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                >
                                    {RANK_HIERARCHY_LIST.map(rank => (
                                        <option key={rank} value={rank}>{rank}</option>
                                    ))}
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
                                    className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
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
                                    className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Questions ({questions.length})</h2>
                        <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                            <i className="ri-add-line mr-1" /> Add Question
                        </Button>
                    </div>

                    {questions.map((q, index) => (
                        <Card key={q.id} className="relative">
                            <button
                                type="button"
                                onClick={() => removeQuestion(q.id)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors"
                                title="Remove Question"
                            >
                                <i className="ri-delete-bin-line text-lg" />
                            </button>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">
                                        Question {index + 1}
                                    </label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        placeholder="Enter question text"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs text-slate-400 uppercase tracking-wider">
                                                    Option {String.fromCharCode(65 + optIdx)}
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${q.id}`}
                                                        checked={q.correctAnswer === optIdx}
                                                        onChange={() => updateQuestion(q.id, 'correctAnswer', optIdx)}
                                                        className="text-gold-500 focus:ring-gold-500 bg-navy-900 border-navy-700"
                                                    />
                                                    <span className="text-xs text-slate-400">Correct</span>
                                                </label>
                                            </div>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                className="w-full px-4 py-2 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors text-sm"
                                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-navy-700">
                    <Link to="/admin/exams">
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit">
                        <i className="ri-rocket-line mr-2" />
                        Publish Exam
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
