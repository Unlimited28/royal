import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockExams, mockExamQuestions } from '../../utils/mockData';
import { getNextRank, isEligibleForExam } from '../../utils/logic';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';

export const ExamSession: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const exam = mockExams.find(e => e.id === Number(id));
    const questions = mockExamQuestions.filter(q => q.exam_id === Number(id));

    const [timeRemaining, setTimeRemaining] = useState(exam?.duration_minutes ? exam.duration_minutes * 60 : 0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);

    useEffect(() => {
        if (timeRemaining > 0 && !showSuccessModal) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeRemaining, showSuccessModal]);

    if (!exam) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Exam Not Found</h2>
                <Button onClick={() => navigate('/ambassador/exams')}>
                    Back to My Exams
                </Button>
            </div>
        );
    }

    const isEligible = user && isEligibleForExam(user.rank || 'Candidate', exam.target_rank);
    const isApproved = user?.exam_approved;

    if (!isEligible || !isApproved) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                <p className="text-slate-400 mb-6">
                    {!isEligible ? "You are not eligible for this rank promotion exam." : "Your exam access has not been approved by your Association President."}
                </p>
                <Button onClick={() => navigate('/ambassador/exams')}>
                    Back to My Exams
                </Button>
            </div>
        );
    }

    const handleAnswer = (questionId: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / questions.length) * 100);
        const isPassed = calculatedScore >= exam.pass_score;

        setScore(calculatedScore);
        setPassed(isPassed);
        setShowSuccessModal(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success/Result Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => navigate('/ambassador/results')}
                title={passed ? "🎉 Congratulations!" : "Keep Trying!"}
            >
                <div className="text-center p-6">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                        {passed ? <i className="ri-checkbox-circle-line text-5xl" /> : <i className="ri-close-circle-line text-5xl" />}
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">{score}%</h2>
                    <p className={`text-lg font-medium mb-6 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                        {passed ? 'You passed the exam!' : 'You did not reach the passing score.'}
                    </p>

                    {passed && (
                        <div className="bg-gold-500/10 border border-gold-500/50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-400 mb-1">New Rank Achieved</p>
                            <p className="text-2xl font-bold text-gold-500">{getNextRank(user?.rank || 'Candidate')}</p>
                        </div>
                    )}

                    <div className="flex flex-col space-y-3">
                        <Button onClick={() => navigate('/ambassador/results')}>
                            View Results Detail
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/ambassador/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">{exam.title}</h1>
                    <p className="text-slate-400">{exam.description}</p>
                </div>
                <div className={`flex items-center space-x-3 px-6 py-3 rounded-xl ${timeRemaining < 300 ? 'bg-red-500/20 border border-red-500/50' : 'bg-blue-500/20 border border-blue-500/50'
                    }`}>
                    <i className={`ri-time-line text-2xl ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-500'}`} />
                    <div>
                        <div className="text-xs text-slate-400">Time Remaining</div>
                        <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progress</span>
                    <span className="text-sm font-bold text-gold-500">{answeredCount}/{questions.length} answered</span>
                </div>
                <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-gold-500 to-yellow-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </Card>

            {/* Current Question */}
            {questions.length > 0 && questions[currentQuestion] && (
                <Card>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-slate-400">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-500">
                                {questions[currentQuestion].points} points
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6">
                            {questions[currentQuestion].question_text}
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {['a', 'b', 'c', 'd'].map((option) => {
                            const optionText = questions[currentQuestion][`option_${option}` as keyof typeof questions[0]] as string;
                            const isSelected = answers[questions[currentQuestion].id] === option;

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(questions[currentQuestion].id, option)}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${isSelected
                                        ? 'border-gold-500 bg-gold-500/10'
                                        : 'border-navy-700 bg-navy-900/50 hover:border-navy-600'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-gold-500 bg-gold-500' : 'border-slate-500'
                                            }`}>
                                            {isSelected && <i className="ri-check-line text-navy-900" />}
                                        </div>
                                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                            {option.toUpperCase()}. {optionText}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-700">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </Button>
                        {currentQuestion < questions.length - 1 ? (
                            <Button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={answeredCount < questions.length}
                            >
                                Submit Exam
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Warning */}
            <Card className="bg-yellow-500/10 border-yellow-500/50">
                <div className="flex items-start space-x-3">
                    <i className="ri-error-warning-line text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-white mb-1">Important Reminders</h4>
                        <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Answer all questions before submitting</li>
                            <li>• You cannot return to the exam after submission</li>
                            <li>• Make sure to review your answers before submitting</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};
