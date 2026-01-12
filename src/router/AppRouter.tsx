
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AmbassadorLayout from '../layouts/AmbassadorLayout';
import PresidentLayout from '../layouts/PresidentLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Auth Pages (don't use a layout)
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Blog = lazy(() => import('../pages/public/Blog'));
const Gallery = lazy(() => import('../pages/public/Gallery'));
const Contact = lazy(() => import('../pages/public/Contact'));
const MediaLive = lazy(() => import('../pages/public/MediaLive'));

// Ambassador Pages
const AmbassadorDashboard = lazy(() => import('../pages/ambassador/Dashboard'));
const Profile = lazy(() => import('../pages/ambassador/Profile'));
const Exams = lazy(() => import('../pages/ambassador/Exams'));
const ExamHistory = lazy(() => import('../pages/ambassador/ExamHistory'));
const AmbassadorNotifications = lazy(() => import('../pages/ambassador/Notifications'));
const Support = lazy(() => import('../pages/ambassador/Support'));

// President Pages
const PresidentDashboard = lazy(() => import('../pages/president/Dashboard'));
const MembersManagement = lazy(() => import('../pages/president/MembersManagement'));
const ExamApproval = lazy(() => import('../pages/president/ExamApproval'));
const CampRegistration = lazy(() => import('../pages/president/CampRegistration'));
const PaymentTracking = lazy(() => import('../pages/president/PaymentTracking'));
const PresidentNotifications = lazy(() => import('../pages/president/Notifications'));

// Super Admin Pages
const GlobalDashboard = lazy(() => import('../pages/admin/GlobalDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AssociationsManagement = lazy(() => import('../pages/admin/AssociationsManagement'));
const ExamControl = lazy(() => import('../pages/admin/ExamControl'));
const FinanceDashboard = lazy(() => import('../pages/admin/FinanceDashboard'));
const PaymentVerification = lazy(() => import('../pages/admin/PaymentVerification'));
const ReceiptGeneration = lazy(() => import('../pages/admin/ReceiptGeneration'));
const BlogGalleryManagement = lazy(() => import('../pages/admin/BlogGalleryManagement'));
const MediaLiveManagement = lazy(() => import('../pages/admin/MediaLiveManagement'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));

// Shared Pages (for authenticated users)
const SharedMediaLive = lazy(() => import('../pages/shared/MediaLive'));
const SharedGallery = lazy(() => import('../pages/shared/Gallery'));

const AppRouter: React.FC = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-light">Loading...</div>}>
            <Routes>
                {/* Auth Routes without Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/media" element={<MediaLive />} />
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* Ambassador Routes */}
                <Route element={<ProtectedRoute allowedRoles={['ambassador']} />}>
                    <Route element={<AmbassadorLayout />}>
                        <Route path="/dashboard" element={<AmbassadorDashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/exams" element={<Exams />} />
                        <Route path="/exam-history" element={<ExamHistory />} />
                        <Route path="/notifications" element={<AmbassadorNotifications />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/ambassador/media" element={<SharedMediaLive />} />
                        <Route path="/ambassador/gallery" element={<SharedGallery />} />
                    </Route>
                </Route>

                {/* President Routes */}
                <Route element={<ProtectedRoute allowedRoles={['president']} />}>
                    <Route element={<PresidentLayout />}>
                        <Route path="/president/dashboard" element={<PresidentDashboard />} />
                        <Route path="/president/members" element={<MembersManagement />} />
                        <Route path="/president/exam-approval" element={<ExamApproval />} />
                        <Route path="/president/camp-registration" element={<CampRegistration />} />
                        <Route path="/president/payments" element={<PaymentTracking />} />
                        <Route path="/president/notifications" element={<PresidentNotifications />} />
                        <Route path="/president/media" element={<SharedMediaLive />} />
                        <Route path="/president/gallery" element={<SharedGallery />} />
                    </Route>
                </Route>

                {/* Super Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                    <Route element={<SuperAdminLayout />}>
                        <Route path="/admin/dashboard" element={<GlobalDashboard />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                        <Route path="/admin/associations" element={<AssociationsManagement />} />
                        <Route path="/admin/exams" element={<ExamControl />} />
                        <Route path="/admin/finance" element={<FinanceDashboard />} />
                        <Route path="/admin/payments" element={<PaymentVerification />} />
                        <Route path="/admin/receipts" element={<ReceiptGeneration />} />
                        <Route path="/admin/blog" element={<BlogGalleryManagement />} />
                        <Route path="/admin/media" element={<MediaLiveManagement />} />
                        <Route path="/admin/settings" element={<SystemSettings />} />
                        <Route path="/admin/logs" element={<AuditLogs />} />
                    </Route>
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<div className="flex justify-center items-center h-screen text-light">404 Not Found</div>} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
