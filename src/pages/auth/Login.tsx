import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const Login: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/ambassador/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <Card className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="Royal Ambassadors Logo" className="h-16 object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Portal Login</h2>
                    <p className="text-slate-400">Enter your credentials to access your dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email or Unique ID"
                        name="email"
                        id="email"
                        placeholder="Enter your email or ID"
                        icon={<i className="ri-mail-line text-xl" />}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        icon={<i className="ri-lock-line text-xl" />}
                        required
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        <i className="ri-login-box-line text-xl mr-2" />
                        Login
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-gold-500 hover:text-white font-semibold transition-colors">
                                Join Now
                            </Link>
                        </p>
                    </div>
                </form>
            </Card>
        </div>
    );
};
