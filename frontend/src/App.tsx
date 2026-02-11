
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './router/ProtectedRoute';
import PublicLayout from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import SystemUnavailable from './components/SystemUnavailable';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const About = lazy(() => import('./pages/public/About'));
const Gallery = lazy(() => import('./pages/public/Gallery'));
const Blog = lazy(() => import('./pages/public/Blog'));
const BlogSingle = lazy(() => import('./pages/public/BlogSingle'));
const Contact = lazy(() => import('./pages/public/Contact'));
const MediaCenter = lazy(() => import('./pages/public/MediaCenter')); // New
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));


// Ambassador Pages
const AmbassadorDashboard = lazy(() => import('./pages/ambassador/AmbassadorDashboard'));
const MyExams = lazy(() => import('./pages/ambassador/MyExams'));
const LiveExam = lazy(() => import('./pages/ambassador/LiveExam'));
const MyResults = lazy(() => import('./pages/ambassador/MyResults'));
const AmbassadorNotifications = lazy(() => import('./pages/ambassador/AmbassadorNotifications'));
const Support = lazy(() => import('./pages/ambassador/Support'));
const ProfileSettings = lazy(() => import('./pages/ambassador/ProfileSettings'));

// President Pages
const PresidentDashboard = lazy(() => import('./pages/president/PresidentDashboard'));
const ManageAmbassadors = lazy(() => import('./pages/president/ManageAmbassadors'));
const ExamApprovals = lazy(() => import('./pages/president/ExamApprovals'));
const CampRegistrations = lazy(() => import('./pages/president/CampRegistrations'));
const PaymentUpload = lazy(() => import('./pages/president/PaymentUpload'));
const PresidentNotifications = lazy(() => import('./pages/president/Notifications'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AssociationsManagement = lazy(() => import('./pages/admin/AssociationsManagement'));
const ExamManagement = lazy(() => import('./pages/admin/ExamManagement'));
const ExamQuestions = lazy(() => import('./pages/admin/ExamQuestions').then(m => ({ default: m.ExamQuestions })));
const FinanceDashboard = lazy(() => import('./pages/admin/FinanceDashboard'));
const PaymentVerification = lazy(() => import('./pages/admin/PaymentVerification'));
const ReceiptGeneration = lazy(() => import('./pages/admin/ReceiptGeneration'));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement'));
const CreateBlogPost = lazy(() => import('./pages/admin/CreateBlogPost'));
const EditBlogPost = lazy(() => import('./pages/admin/EditBlogPost'));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'));
const ManageMedia = lazy(() => import('./pages/admin/ManageMedia'));
const CreateExam = lazy(() => import('./pages/admin/CreateExam'));
const ResultsPublishing = lazy(() => import('./pages/admin/ResultsPublishing'));
const AdsManagement = lazy(() => import('./pages/admin/AdsManagement'));
const CreateAd = lazy(() => import('./pages/admin/CreateAd'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

const App: React.FC = () => {
    const [backendDown, setBackendDown] = useState(false);

    useEffect(() => {
        const handleDown = () => setBackendDown(true);
        window.addEventListener('backend-unreachable', handleDown);
        return () => window.removeEventListener('backend-unreachable', handleDown);
    }, []);

    if (backendDown) {
        return <SystemUnavailable />;
    }

    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<PublicLayout />}>
                        <Route index element={<Home />} />
                        <Route path="about" element={<About />} />
                        <Route path="gallery" element={<Gallery />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:idOrSlug" element={<BlogSingle />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="media" element={<MediaCenter />} />
                    </Route>

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Ambassador Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ambassador']} />}>
                        <Route element={<DashboardLayout role="ambassador" />}>
                            <Route path="/dashboard" element={<AmbassadorDashboard />} />
                            <Route path="/ambassador/exams" element={<MyExams />} />
                            <Route path="/ambassador/exam/:id" element={<LiveExam />} />
                            <Route path="/ambassador/results" element={<MyResults />} />
                            <Route path="/ambassador/profile" element={<ProfileSettings />} />
                            <Route path="/ambassador/notifications" element={<AmbassadorNotifications />} />
                            <Route path="/ambassador/support" element={<Support />} />
                            <Route path="/ambassador/blog" element={<Blog />} />
                            <Route path="/ambassador/gallery" element={<Gallery />} />
                            <Route path="/ambassador/media" element={<MediaCenter />} />
                        </Route>
                    </Route>

                    {/* Association President Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['president']} />}>
                        <Route element={<DashboardLayout role="president" />}>
                            <Route path="/president/dashboard" element={<PresidentDashboard />} />
                            <Route path="/president/members" element={<ManageAmbassadors />} />
                            <Route path="/president/approvals" element={<ExamApprovals />} />
                            <Route path="/president/camp-registrations" element={<CampRegistrations />} />
                            <Route path="/president/payments" element={<PaymentUpload />} />
                            <Route path="/president/notifications" element={<PresidentNotifications />} />
                            <Route path="/president/blog" element={<Blog />} />
                            <Route path="/president/gallery" element={<Gallery />} />
                            <Route path="/president/media" element={<MediaCenter />} />
                        </Route>
                    </Route>

                    {/* Super Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
                        <Route element={<DashboardLayout role="superadmin" />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users" element={<UserManagement />} />
                            <Route path="/admin/associations" element={<AssociationsManagement />} />
                            <Route path="/admin/exams" element={<ExamManagement />} />
                            <Route path="/admin/exams/questions/:examId" element={<ExamQuestions />} />
                            <Route path="/admin/finance" element={<FinanceDashboard />} />
                            <Route path="/admin/payments" element={<PaymentVerification />} />
                            <Route path="/admin/receipts" element={<ReceiptGeneration />} />
                            <Route path="/admin/blog" element={<BlogManagement />} />
                            <Route path="/admin/blog/create" element={<CreateBlogPost />} />
                            <Route path="/admin/blog/edit/:id" element={<EditBlogPost />} />
                            <Route path="/admin/gallery" element={<GalleryManagement />} />
                            <Route path="/admin/media" element={<ManageMedia />} />
                            <Route path="/admin/exams/create" element={<CreateExam />} />
                            <Route path="/admin/exams/release" element={<ResultsPublishing />} />
                            <Route path="/admin/ads" element={<AdsManagement />} />
                            <Route path="/admin/ads/create" element={<CreateAd />} />
                            <Route path="/admin/settings" element={<SystemSettings />} />
                            <Route path="/admin/audit" element={<AuditLogs />} />
                            {/* Shared Content Views for Admin */}
                            <Route path="/admin/blog-view" element={<Blog />} />
                            <Route path="/admin/gallery-view" element={<Gallery />} />
                            <Route path="/admin/media-view" element={<MediaCenter />} />
                        </Route>
                    </Route>

                    {/* Fallback Route */}
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default App;
