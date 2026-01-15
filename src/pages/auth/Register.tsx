
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { OFFICIAL_ASSOCIATIONS, OFFICIAL_RANKS } from '../../constants';
import logo from '../../assets/logo.png';
import { register, type RegisterData } from '../../services/authService';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState('ambassador');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries()) as unknown as RegisterData;

        try {
            await register(data);
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown registration error occurred.';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    const associationOptions = [
        { label: '-- Select Association --', value: '' },
        ...OFFICIAL_ASSOCIATIONS.map(a => ({ label: a, value: a }))
    ];

    const rankOptions = [
        { label: '-- Select Rank --', value: '' },
        ...OFFICIAL_RANKS.map(r => ({ label: r, value: r }))
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10 py-12">
            <Card className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="Royal Ambassadors Logo" className="h-12 object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Join Royal Ambassadors</h2>
                    <p className="text-slate-400">Create your account to start your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2">
                        <Select
                            label="Select Your Role"
                            name="role"
                            id="role"
                            options={[
                                { label: 'Ambassador', value: 'ambassador' },
                                { label: 'Association President', value: 'president' },
                            ]}
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                    </div>

                    {(role === 'president' || role === 'super_admin') && (
                        <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                            <Input
                                label="Passcode"
                                name="passcode"
                                id="passcode"
                                placeholder="Enter admin passcode"
                                required
                            />
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-2">
                        <Input
                            label="Full Name"
                            name="fullname"
                            id="fullname"
                            required
                        />
                    </div>

                    <Input label="Email" name="email" id="email" type="email" required />
                    <Input label="Phone Number" name="phone" id="phone" type="tel" required />
                    <Input label="Church" name="church" id="church" required />
                    <Input label="Age" name="age" id="age" type="number" min={1} max={120} required />

                    {(role === 'ambassador' || role === 'president') && (
                        <div className="col-span-1 md:col-span-2">
                            <Select
                                label="Association"
                                name="association_id"
                                id="association"
                                options={associationOptions}
                                required
                            />
                        </div>
                    )}

                    {role === 'ambassador' && (
                        <div className="col-span-1 md:col-span-2">
                            <Select
                                label="Current Rank"
                                name="rank_id"
                                id="rank"
                                options={rankOptions}
                                required
                            />
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-2">
                        <Input
                            label="Password"
                            name="password"
                            id="password"
                            type="password"
                            required
                        />
                         <div className="mt-2 p-3 bg-navy-900/50 rounded-lg text-xs text-slate-400">
                            <p className="font-semibold mb-1">Password Requirements:</p>
                            <ul className="list-disc list-inside space-y-0.5 ml-1">
                                <li>At least 8 characters long</li>
                                <li>At least one uppercase & lowercase letter</li>
                                <li>At least one number & special character</li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <Button type="submit" className="w-full" size="lg" variant="primary" isLoading={isLoading}>
                             {isLoading ? 'Registering...' : (
                                <>
                                    <i className="ri-user-add-line text-xl mr-2" />
                                    Register Now
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold-500 hover:text-white font-semibold transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default Register;
