import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-12 text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-accent mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-slate-400 text-lg">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex items-center justify-center space-x-4">
                    <Link to="/">
                        <Button>
                            <i className="ri-home-line mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <i className="ri-arrow-left-line mr-2" />
                        Go Back
                    </Button>
                </div>

                <div className="mt-12 pt-8 border-t border-navy-700">
                    <p className="text-slate-500 text-sm">
                        If you believe this is an error, please contact support.
                    </p>
                </div>
            </Card>
        </div>
    );
};
