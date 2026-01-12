<?php
/**
 * Application Constants
 * Store ranks, associations, file paths, etc.
 */

// Royal Ambassador Ranks (Updated to match database seeds)
define('RA_RANKS', [
    1 => 'Candidate',
    2 => 'Assistant Intern', 
    3 => 'Intern',
    4 => 'Senior Intern',
    5 => 'Envoy',
    6 => 'Senior Envoy',
    7 => 'Special Envoy',
    8 => 'Dean',
    9 => 'Ambassador',
    10 => 'Ambassador Extraordinary',
    11 => 'Ambassador Plenipotentiary'
]);

// User Roles
define('USER_ROLES', [
    'ambassador' => 'Ambassador',
    'president' => 'Association President', 
    'admin' => 'Administrator',
    'superadmin' => 'Super Administrator'
]);

// Official Baptist Associations (Updated to match database seeds)
define('ASSOCIATIONS', [
    'Agape Baptist Association',
    'Abeokuta North West Baptist Association',
    'Ketu Baptist Association',
    'Irepodun Oke-Yewa Baptist Association',
    'Zion Baptist Association',
    'Abeokuta South Baptist Association',
    'Ijebu North East Baptist Association',
    'Great Grace Baptist Association',
    'Abeokuta East Baptist Association',
    'Upper Room Baptist Association',
    'Ijebu North Baptist Association',
    'Abeokuta North-East Baptist Association',
    'Abeokuta west Baptist Association',
    'Bethel Baptist Association',
    'Ayetoro Baptist Association',
    'Dominion Baptist Association',
    'Iroyin Ayo Baptist Association',
    'Ijebu Central Baptist Association',
    'Rehoboth Baptist Association',
    'Christlife Baptist Association',
    'Ifeoluwa Baptist Association',
    'Ijebu Progressive Baptist Association',
    'Yewa Baptist Association',
    'Ayooluwa Baptist Association',
    'Macedonia Baptist Association'
]);

// File Upload Paths
define('UPLOAD_PATHS', [
    'profiles' => '/uploads/profiles/',
    'documents' => '/uploads/documents/',
    'gallery' => '/uploads/gallery/',
    'blog' => '/uploads/blog/',
    'camp' => '/uploads/camp/',
    'exams' => '/uploads/exams/'
]);

// Payment Status
define('PAYMENT_STATUS', [
    'pending' => 'Pending',
    'processing' => 'Processing',
    'completed' => 'Completed',
    'failed' => 'Failed',
    'cancelled' => 'Cancelled',
    'refunded' => 'Refunded'
]);

// Exam Status
define('EXAM_STATUS', [
    'draft' => 'Draft',
    'published' => 'Published',
    'archived' => 'Archived'
]);

// Registration Status
define('REGISTRATION_STATUS', [
    'pending' => 'Pending Approval',
    'approved' => 'Approved',
    'rejected' => 'Rejected',
    'suspended' => 'Suspended'
]);

// Notification Types
define('NOTIFICATION_TYPES', [
    'info' => 'Information',
    'success' => 'Success',
    'warning' => 'Warning',
    'error' => 'Error',
    'exam' => 'Exam',
    'payment' => 'Payment',
    'camp' => 'Camp',
    'promotion' => 'Promotion'
]);

// Activity Log Types
define('LOG_TYPES', [
    'login' => 'User Login',
    'logout' => 'User Logout',
    'registration' => 'User Registration',
    'profile_update' => 'Profile Update',
    'password_change' => 'Password Change',
    'exam_attempt' => 'Exam Attempt',
    'payment' => 'Payment',
    'admin_action' => 'Admin Action',
    'security' => 'Security Event'
]);

// Camp Registration Status
define('CAMP_STATUS', [
    'upcoming' => 'Upcoming',
    'open' => 'Registration Open',
    'full' => 'Registration Full',
    'closed' => 'Registration Closed',
    'completed' => 'Completed',
    'cancelled' => 'Cancelled'
]);

// Pagination constants
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Security constants
define('PASSWORD_RESET_EXPIRY', 86400); // 24 hours
define('EMAIL_VERIFICATION_EXPIRY', 86400); // 24 hours
define('REMEMBER_TOKEN_EXPIRY', 2592000); // 30 days
define('PASSWORD_MIN_LENGTH', 8); // Added missing constant
define('SESSION_TIMEOUT', 3600); // Added missing constant (1 hour)

// Cache constants
define('CACHE_TTL', 3600); // 1 hour
define('SESSION_CACHE_TTL', 1800); // 30 minutes

// Super Admin and President passcodes
define('SUPER_ADMIN_PASSCODE', $_ENV['SUPER_ADMIN_PASSCODE'] ?? 'RABCN2024OGBC');
define('PRESIDENT_PASSCODE', $_ENV['PRESIDENT_PASSCODE'] ?? 'RABCNPRES2024');

// API Rate Limits (requests per minute)
define('API_RATE_LIMITS', [
    'login' => 5,
    'register' => 3,
    'password_reset' => 2,
    'general' => 60,
    'admin' => 120
]);

// Rate limit constants (Added missing constants)
define('RATE_LIMIT_LOGIN', 5);
define('RATE_LIMIT_REGISTER', 3);
define('RATE_LIMIT_PASSWORD_RESET', 2);

// File size limits (in bytes)
define('FILE_SIZE_LIMITS', [
    'image' => 2097152, // 2MB
    'document' => 5242880, // 5MB
    'video' => 52428800, // 50MB
    'audio' => 10485760 // 10MB
]);

// Max file size constant (Added missing constant)
define('MAX_FILE_SIZE', 5242880); // 5MB default

// Allowed MIME types
define('ALLOWED_MIME_TYPES', [
    'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'video' => ['video/mp4', 'video/avi', 'video/mov'],
    'audio' => ['audio/mp3', 'audio/wav', 'audio/ogg']
]);

// Email configuration constants (Added missing constants)
define('FROM_EMAIL', $_ENV['FROM_EMAIL'] ?? 'noreply@ogbc.org');
define('FROM_NAME', $_ENV['FROM_NAME'] ?? 'Royal Ambassadors OGBC');

// Email templates
define('EMAIL_TEMPLATES', [
    'welcome' => 'Welcome to Royal Ambassadors OGBC',
    'verification' => 'Email Verification Required',
    'password_reset' => 'Password Reset Request',
    'exam_result' => 'Exam Result Notification',
    'payment_confirmation' => 'Payment Confirmation',
    'camp_registration' => 'Camp Registration Confirmation'
]);

// Application environment constants (Added missing constants)
if (!defined('APP_ENV')) {
    define('APP_ENV', $_ENV['APP_ENV'] ?? 'development');
}