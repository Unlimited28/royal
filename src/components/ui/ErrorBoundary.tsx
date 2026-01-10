import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary flex items-center justify-center p-4">
                    <Card className="max-w-2xl w-full p-8 text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="ri-alert-line text-4xl text-red-500" />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4">
                            Oops! Something went wrong
                        </h1>

                        <p className="text-slate-400 mb-6">
                            We encountered an unexpected error. Our team has been notified and we're working on a fix.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-primary/50 border border-red-500/50 rounded-lg p-4 mb-6 text-left">
                                <p className="text-red-500 font-mono text-sm mb-2">
                                    {this.state.error.message}
                                </p>
                                <pre className="text-xs text-slate-500 overflow-auto">
                                    {this.state.error.stack}
                                </pre>
                            </div>
                        )}

                        <div className="flex items-center justify-center space-x-4">
                            <Button variant="outline" onClick={() => window.history.back()}>
                                Go Back
                            </Button>
                            <Button onClick={this.handleReset}>
                                Return to Home
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
