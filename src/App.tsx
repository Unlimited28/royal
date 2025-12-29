import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Spinner } from './components/ui/Spinner';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { BlogSingle } from './pages/BlogSingle';
import { Contact } from './pages/Contact';
import { Gallery } from './pages/Gallery';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { NotFound } from './pages/NotFound';

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const ExamManagement = lazy(() => import('./pages/admin/ExamManagement').then(m => ({ default: m.ExamManagement })));
const ExamQuestions = lazy(() => import('./pages/admin/ExamQuestions').then(m => ({ default: m.ExamQuestions })));
const CreateExam = lazy(() => import('./pages/admin/CreateExam').then(m => ({ default: m.CreateExam })));
const ResultsPublishing = lazy(() => import('./pages/admin/ResultsPublishing').then(m => ({ default: m.ResultsPublishing })));
const VoucherManagement = lazy(() => import('./pages/admin/VoucherManagement').then(m => ({ default: m.VoucherManagement })));
const FinanceDashboard = lazy(() => import('./pages/admin/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const FinanceOversight = lazy(() => import('./pages/admin/FinanceOversight').then(m => ({ default: m.FinanceOversight })));
const CampFiles = lazy(() => import('./pages/admin/CampFiles').then(m => ({ default: m.CampFiles })));
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings').then(m => ({ default: m.SystemSettings })));
const BlogManagement = lazy(() => import('./pages/admin/BlogManagement').then(m => ({ default: m.BlogManagement })));
const CreateBlogPost = lazy(() => import('./pages/admin/CreateBlogPost').then(m => ({ default: m.CreateBlogPost })));
const EditBlogPost = lazy(() => import('./pages/admin/EditBlogPost').then(m => ({ default: m.EditBlogPost })));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement').then(m => ({ default: m.GalleryManagement })));
const NotificationsCenter = lazy(() => import('./pages/admin/NotificationsCenter').then(m => ({ default: m.NotificationsCenter })));
const NotificationManagement = lazy(() => import('./pages/admin/NotificationManagement').then(m => ({ default: m.NotificationManagement })));
const ContentModeration = lazy(() => import('./pages/admin/ContentModeration').then(m => ({ default: m.ContentModeration })));
const AdsManagement = lazy(() => import('./pages/admin/AdsManagement').then(m => ({ default: m.AdsManagement })));

// Lazy-loaded Ambassador Pages
const AmbassadorDashboard = lazy(() => import('./pages/ambassador/AmbassadorDashboard').then(m => ({ default: m.AmbassadorDashboard })));
const MyExams = lazy(() => import('./pages/ambassador/MyExams').then(m => ({ default: m.MyExams })));
const MyResults = lazy(() => import('./pages/ambassador/MyResults').then(m => ({ default: m.MyResults })));
const ExamSession = lazy(() => import('./pages/ambassador/ExamSession').then(m => ({ default: m.ExamSession })));
const LiveExam = lazy(() => import('./pages/ambassador/LiveExam').then(m => ({ default: m.LiveExam })));
const LiveExamEnhanced = lazy(() => import('./pages/ambassador/LiveExamEnhanced').then(m => ({ default: m.LiveExamEnhanced })));
const AmbassadorProfileSettings = lazy(() => import('./pages/ambassador/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const SubmitExam = lazy(() => import('./pages/ambassador/SubmitExam').then(m => ({ default: m.SubmitExam })));

// Lazy-loaded President Pages
const PresidentDashboard = lazy(() => import('./pages/president/PresidentDashboard').then(m => ({ default: m.PresidentDashboard })));
const ManageAmbassadors = lazy(() => import('./pages/president/ManageAmbassadors').then(m => ({ default: m.ManageAmbassadors })));
const ExamApprovals = lazy(() => import('./pages/president/ExamApprovals').then(m => ({ default: m.ExamApprovals })));
const CampRegistrations = lazy(() => import('./pages/president/CampRegistrations').then(m => ({ default: m.CampRegistrations })));
const PaymentUpload = lazy(() => import('./pages/president/PaymentUpload').then(m => ({ default: m.PaymentUpload })));
const PresidentNotifications = lazy(() => import('./pages/president/Notifications').then(m => ({ default: m.Notifications })));
const PresidentProfileSettings = lazy(() => import('./pages/president/ProfileSettings').then(m => ({ default: m.ProfileSettings })));

// A layout component for protected routes that includes the dashboard shell
const ProtectedLayout = ({ role }: { role: 'admin' | 'ambassador' | 'president' }) => (
    <DashboardLayout role={role}>
        <Suspense fallback={<Spinner />}>
            <Outlet />
        </Suspense>
    </DashboardLayout>
);


function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* ==================== PUBLIC ROUTES ==================== */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogSingle />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                        {/* ==================== ADMIN ROUTES ==================== */}
                        <Route path="/admin" element={<ProtectedLayout role="admin" />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="exams" element={<ExamManagement />} />
                            <Route path="exams/questions/:examId" element={<ExamQuestions />} />
                            <Route path="exams/create" element={<CreateExam />} />
                            <Route path="results" element={<ResultsPublishing />} />
                            <Route path="vouchers" element={<VoucherManagement />} />
                            <Route path="finance" element={<FinanceDashboard />} />
                            <Route path="finance/oversight" element={<FinanceOversight />} />
                            <Route path="camp-files" element={<CampFiles />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="system-settings" element={<SystemSettings />} />
                            <Route path="blog" element={<BlogManagement />} />
                            <Route path="blog/create" element={<CreateBlogPost />} />
                            <Route path="blog/edit/:id" element={<EditBlogPost />} />
                            <Route path="gallery" element={<GalleryManagement />} />
                            <Route path="notifications" element={<NotificationsCenter />} />
                            <Route path="notifications/manage" element={<NotificationManagement />} />
                            <Route path="moderation" element={<ContentModeration />} />
                            <Route path="ads" element={<AdsManagement />} />
                        </Route>

                        {/* ==================== AMBASSADOR ROUTES ==================== */}
                        <Route path="/ambassador" element={<ProtectedLayout role="ambassador" />}>
                            <Route path="dashboard" element={<AmbassadorDashboard />} />
                            <Route path="exams" element={<MyExams />} />
                            <Route path="results" element={<MyResults />} />
                            <Route path="exam/:id" element={<ExamSession />} />
                            <Route path="exam/live/:id" element={<LiveExam />} />
                            <Route path="exam/live-enhanced/:id" element={<LiveExamEnhanced />} />
                            <Route path="profile" element={<AmbassadorProfileSettings />} />
                            <Route path="exam/submit/:id" element={<SubmitExam />} />
                        </Route>

                        {/* ==================== PRESIDENT ROUTES ==================== */}
                        <Route path="/president" element={<ProtectedLayout role="president" />}>
                            <Route path="dashboard" element={<PresidentDashboard />} />
                            <Route path="ambassadors" element={<ManageAmbassadors />} />
                            <Route path="exam-approvals" element={<ExamApprovals />} />
                            <Route path="camp-registrations" element={<CampRegistrations />} />
                            <Route path="payments" element={<PaymentUpload />} />
                            <Route path="notifications" element={<PresidentNotifications />} />
                            <Route path="profile" element={<PresidentProfileSettings />} />
                        </Route>

                        {/* 404 Catch-All */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
