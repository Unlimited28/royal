import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SubmitExam: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const handleConfirm = () => {
        console.log('Exam submitted for exam ID:', id);
        navigate('/ambassador/results');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="text-center p-12">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="ri-checkbox-circle-line text-5xl text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Submit Exam?</h1>
                <p className="text-slate-400 mb-8">
                    You are about to submit your exam. Once submitted, you cannot make any changes to your answers.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-white mb-3">Before You Submit</h3>
                    <ul className="text-left space-y-2 text-slate-300 text-sm">
                        <li>✓ Review all your answers carefully</li>
                        <li>✓ Ensure you have answered all questions</li>
                        <li>✓ Check for any questions you may have skipped</li>
                        <li>✓ Your results will be available after admin review</li>
                    </ul>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/ambassador/exam/${id}`)}
                    >
                        Review Answers
                    </Button>
                    <Button onClick={handleConfirm}>
                        <i className="ri-check-line mr-2" />
                        Confirm Submission
                    </Button>
                </div>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/50">
                <div className="flex items-start space-x-3">
                    <i className="ri-alert-line text-xl text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-white mb-1">Important Notice</h4>
                        <p className="text-sm text-slate-300">
                            After submission, your exam will be reviewed by the administration.
                            Results will be published within 48 hours. You will receive a notification
                            when your results are ready.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
