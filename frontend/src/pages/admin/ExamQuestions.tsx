import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import api from '../../services/api';

export const ExamQuestions: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const response = await api.get(`/exams/${examId}`);
                setExam(response.data);
                setQuestions(response.data.questions?.map((q: any, index: number) => ({
                    ...q,
                    id: q._id,
                    displayIndex: index + 1
                })) || []);
            } catch (error) {
                console.error('Failed to fetch exam details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExamData();
    }, [examId]);

    if (loading) return <div className="text-white p-20 text-center">Loading exam questions...</div>;

    if (!exam) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Exam Not Found</h2>
                <Link to="/admin/exams" className="text-gold-500 hover:text-gold-400">
                    ← Back to Exam Management
                </Link>
            </div>
        );
    }

    const columns: Column<any>[] = [
        {
            header: '#',
            accessorKey: 'displayIndex',
        },
        {
            header: 'Question',
            cell: (question: any) => (
                <div className="max-w-md">
                    <p className="text-white font-medium">{question.question_text}</p>
                    <div className="mt-2 space-y-1 text-xs">
                        {question.options?.map((opt: string, i: number) => (
                            <div key={i} className="text-slate-400">
                                {String.fromCharCode(65 + i)}. {opt}
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            header: 'Correct Answer',
            cell: (question: any) => (
                <div className="flex items-center space-x-2">
                    <i className="ri-checkbox-circle-line text-green-500" />
                    <span className="text-green-500 font-bold uppercase">
                        {String.fromCharCode(65 + (question.correctAnswer || 0))}
                    </span>
                </div>
            )
        },
        {
            header: 'Points',
            cell: (question: any) => (
                <span className="text-slate-300">{question.points}</span>
            )
        },
        {
            header: 'Actions',
            cell: () => (
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Edit Question"
                    >
                        <i className="ri-pencil-line text-gold-500" />
                    </button>
                    <button
                        className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Delete Question"
                    >
                        <i className="ri-delete-bin-line text-red-500" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Link
                to="/admin/exams"
                className="inline-flex items-center text-gold-500 hover:text-gold-400 transition-colors"
            >
                <i className="ri-arrow-left-line mr-2" />
                Back to Exam Management
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{exam.title}</h1>
                    <p className="text-slate-400">{exam.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                        <span>Rank: {exam.rank_required}</span>
                        <span>•</span>
                        <span>Duration: {exam.duration_minutes} mins</span>
                        <span>•</span>
                        <span>Pass Score: {exam.pass_score}%</span>
                    </div>
                </div>
                <Button>
                    <i className="ri-add-line mr-2" />
                    Add Question
                </Button>
            </div>

            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                        Exam Questions
                    </h3>
                    <div className="text-sm text-slate-400">
                        {questions.length} of {exam.questions_count} questions
                    </div>
                </div>

                {questions.length > 0 ? (
                    <DataTable
                        data={questions}
                        columns={columns}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400 mb-4">No questions added yet</p>
                        <Button variant="outline">
                            <i className="ri-add-line mr-2" />
                            Add First Question
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
