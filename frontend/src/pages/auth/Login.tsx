
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { type LoginCredentials } from '../../services/authService';

export const Login: React.FC = () => {
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '', role: '' });
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            const roles = user.roles || [];
            if (roles.includes('superadmin') || roles.includes('admin')) {
                navigate('/admin/dashboard');
            } else if (roles.includes('president')) {
                navigate('/president/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(credentials);
            // On successful login, AuthContext will update the user state.
            // App-level routing logic will handle redirection.
            switch (credentials.role) {
                case 'ambassador':
                    navigate('/dashboard');
                    break;
                case 'president':
                    navigate('/president/dashboard');
                    break;
                case 'admin':
                case 'superadmin':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Error toast is already handled in AuthContext.
        }
    };

    const isLoginDisabled = !credentials.role;

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
                    <Select
                        label="Role Selector"
                        name="role"
                        id="role"
                        value={credentials.role}
                        onChange={handleChange}
                        options={[
                            { label: 'Select a role', value: '' },
                            { label: 'Ambassador', value: 'ambassador' },
                            { label: 'Association President', value: 'president' },
                            { label: 'Super Admin', value: 'superadmin' },
                        ]}
                        required
                    />

                    {(credentials.role === 'president' || credentials.role === 'superadmin') && (
                        <Input
                            label="Admin Passcode"
                            name="passcode"
                            id="passcode"
                            type="password"
                            placeholder="Enter required passcode"
                            icon={<i className="ri-shield-keyhole-line text-xl" />}
                            value={credentials.passcode || ''}
                            onChange={handleChange}
                            required
                        />
                    )}

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

                    <Button type="submit" name="login" className="w-full" size="lg" disabled={loading || isLoginDisabled}>
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

export default Login;
