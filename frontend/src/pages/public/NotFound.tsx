import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
            <h1 className="text-9xl font-bold text-gold-500">404</h1>
            <h2 className="text-3xl mt-4">Page Not Found</h2>
            <p className="mt-2 text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/" className="mt-8 px-6 py-3 bg-gold-500 text-navy-900 font-bold rounded-lg hover:bg-gold-600">
                Go Home
            </Link>
        </div>
    );
};

export default NotFound;
