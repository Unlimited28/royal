
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Gallery = lazy(() => import('../pages/public/Gallery'));
const Blog = lazy(() => import('../pages/public/Blog'));
const Contact = lazy(() => import('../pages/public/Contact'));
const MediaCenter = lazy(() => import('../pages/public/MediaCenter')); // New
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));


// Ambassador Pages
const AmbassadorDashboard = lazy(() => import('../pages/ambassador/Dashboard'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const ManageMedia = lazy(() => import('../pages/admin/ManageMedia')); // New

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/media" element={<MediaCenter />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Ambassador Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ambassador', 'superadmin']} />}>
                        <Route path="/dashboard" element={<AmbassadorDashboard />} />
                    </Route>

                    {/* Super Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/media" element={<ManageMedia />} />
                    </Route>

                    {/* Fallback Route */}
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRouter;
