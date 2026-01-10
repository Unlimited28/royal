import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        // Simulate sending reset email
        setIsSubmitted(true);
        setMessage('If an account with that email exists, password reset instructions have been sent.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-primary to-navy-950 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="bg-gradient-to-br from-primary/80 to-primary-dark/60 backdrop-blur-sm border border-navy-700 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <i className="ri-mail-line text-4xl text-navy-950" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                        <p className="text-slate-400">
                            Enter your email address and we'll send you instructions to reset your password
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Alert */}
                    {message && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">{message}</p>
                        </div>
                    )}

                    {/* Form */}
                    {!isSubmitted && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-slate-300 font-medium mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-primary/50 border border-navy-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                                    placeholder="your.email@example.com"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Send Reset Instructions
                            </Button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-accent hover:text-gold-400 transition-colors font-medium"
                        >
                            <i className="ri-arrow-left-line mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Remember your password? <Link to="/login" className="text-accent hover:text-gold-400">Sign in</Link>
                </p>
            </div>
        </div>
    );
};
