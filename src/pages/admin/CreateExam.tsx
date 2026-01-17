import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RANK_HIERARCHY } from '../../utils/logic';

interface Question {
    text: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correct_option: 'a' | 'b' | 'c' | 'd';
}

const CreateExam: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_rank: 'Assistant Intern',
        duration_minutes: 45,
        pass_score: 60,
    });

    const [questions, setQuestions] = useState<Question[]>([
        { text: '', options: { a: '', b: '', c: '', d: '' }, correct_option: 'a' }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: { a: '', b: '', c: '', d: '' }, correct_option: 'a' }]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, field: string, value: string) => {
        const newQuestions = [...questions];
        if (field.startsWith('option_')) {
            const optionKey = field.split('_')[1] as keyof Question['options'];
            newQuestions[index].options[optionKey] = value;
        } else if (field === 'text') {
            newQuestions[index].text = value;
        } else if (field === 'correct_option') {
            newQuestions[index].correct_option = value as 'a' | 'b' | 'c' | 'd';
        }
        setQuestions(newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Creating exam:', { ...formData, questions });
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

    const ranks = Object.keys(RANK_HIERARCHY);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <Link
                to="/admin/exams"
                className="inline-flex items-center text-gold-500 hover:text-gold-400 transition-colors"
            >
                <i className="ri-arrow-left-line mr-2" />
                Back to Exam Management
            </Link>

            <div>
                <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
                <p className="text-slate-400">Set up a new ranking examination with multiple questions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white border-b border-navy-700 pb-4">General Information</h3>
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
                                placeholder="e.g., Assistant Intern Promotion Exam"
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
                                <label htmlFor="target_rank" className="block text-slate-300 font-medium mb-2">
                                    Target Rank *
                                </label>
                                <select
                                    id="target_rank"
                                    name="target_rank"
                                    value={formData.target_rank}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                >
                                    {ranks.filter(r => r !== 'Candidate').map(rank => (
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
                                    min="5"
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
                                    min="1"
                                    max="100"
                                    className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Questions ({questions.length})</h2>
                        <Button type="button" onClick={handleAddQuestion} variant="outline" size="sm">
                            <i className="ri-add-line mr-2" /> Add Question
                        </Button>
                    </div>

                    {questions.map((q, index) => (
                        <Card key={index} className="relative">
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(index)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors"
                                title="Remove Question"
                                disabled={questions.length === 1}
                            >
                                <i className="ri-delete-bin-line text-xl" />
                            </button>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-slate-300 font-medium mb-2">
                                        Question {index + 1} *
                                    </label>
                                    <input
                                        type="text"
                                        value={q.text}
                                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                        className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-gold-500 transition-colors"
                                        placeholder="Enter the question text"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                                        <div key={opt}>
                                            <label className="block text-slate-400 text-xs font-medium mb-1 uppercase">
                                                Option {opt.toUpperCase()} *
                                            </label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name={`correct_${index}`}
                                                    checked={q.correct_option === opt}
                                                    onChange={() => handleQuestionChange(index, 'correct_option', opt)}
                                                    className="w-4 h-4 accent-gold-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={q.options[opt]}
                                                    onChange={(e) => handleQuestionChange(index, `option_${opt}`, e.target.value)}
                                                    className="w-full px-3 py-2 bg-navy-900/50 border border-navy-700 rounded text-sm text-white focus:outline-none focus:border-gold-500 transition-colors"
                                                    placeholder={`Option ${opt.toUpperCase()}`}
                                                    required
                                                />
                                            </div>
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
                        <i className="ri-save-line mr-2" />
                        Create Exam and Save Questions
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
