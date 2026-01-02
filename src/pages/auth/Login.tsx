
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { LoginCredentials } from '../../services/authService';

const getDashboardPath = (role: string): string => {
    switch (role) {
        case 'ambassador':
            return '/dashboard';
        case 'superadmin':
            return '/admin/dashboard';
        default:
            return '/';
    }
};

export const Login: React.FC = () => {
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' });
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
            // The AuthContext will update the user state. We can use a useEffect in a layout component
            // or here to redirect based on the new user role.
            // For simplicity, let's just navigate after login promise resolves.
            // A more robust solution might wait for the user object to be updated.
            const token = localStorage.getItem('ra_token');
            if (token) {
                // This is a bit of a hack. A better way would be for the login function to return the user.
                const { role } = JSON.parse(atob(token.split('.')[1]));
                navigate(getDashboardPath(role));
            } else {
                 navigate('/'); // fallback
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Error toast is handled in AuthContext
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 bg-navy-900">
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
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
id="password"
                        type="password"
                        placeholder="Enter your password"
                        icon={<i className="ri-lock-line text-xl" />}
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" name="login" className="w-full" size="lg" disabled={loading}>
                        {loading ? 'Logging in...' : (
                            <>
                                <i className="ri-login-box-line text-xl mr-2" />
                                Login
                            </>
                        )}
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
