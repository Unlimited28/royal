<?php

/**
 * Web Routes for Royal Ambassadors OGBC Portal
 * Phase 3: Complete Feature Integration
 */

use App\Controllers\AuthController;
use App\Controllers\ExamController;
use App\Controllers\PaymentController;
use App\Controllers\NotificationController;
use App\Controllers\CampController;
use App\Core\Router;

$router = new Router();

// ===== Authentication Routes =====
$router->get('/', function() {
    header('Location: /login');
    exit;
});

$router->get('/login', [AuthController::class, 'showLogin']);
$router->post('/login', [AuthController::class, 'login']);
$router->get('/register', [AuthController::class, 'showRegister']);
$router->post('/register', [AuthController::class, 'register']);
$router->get('/logout', [AuthController::class, 'logout']);
$router->post('/logout', [AuthController::class, 'logout']);

// Password Reset Routes
$router->get('/forgot-password', [AuthController::class, 'showForgotPassword']);
$router->post('/forgot-password', [AuthController::class, 'sendResetLink']);
$router->get('/reset-password/{token}', [AuthController::class, 'showResetForm']);
$router->post('/reset-password', [AuthController::class, 'resetPassword']);

// Email Verification
$router->get('/verify-email/{token}', [AuthController::class, 'verifyEmail']);
$router->get('/resend-verification', [AuthController::class, 'resendVerification']);

// ===== Dashboard Routes (Role-based redirection) =====
$router->get('/dashboard', function() {
    $sessionManager = \App\Core\SessionManager::getInstance();
    $sessionManager->redirectToDashboard();
});

// ===== Exam System Routes =====
$router->group(['middleware' => 'auth'], function($router) {
    // Exam Dashboard
    $router->get('/exam/dashboard', [ExamController::class, 'dashboard']);
    
    // Taking Exams (All authenticated users)
    $router->get('/exam/take/{id}', [ExamController::class, 'takeExam']);
    $router->post('/exam/submit', [ExamController::class, 'submitExam']);
    $router->get('/exam/result/{id}', [ExamController::class, 'showResult']);
    
    // Exam Management (Admin only)
    $router->group(['middleware' => 'role:admin'], function($router) {
        $router->get('/exam/create', [ExamController::class, 'create']);
        $router->post('/exam/store', [ExamController::class, 'store']);
        $router->get('/exam/edit/{id}', [ExamController::class, 'edit']);
        $router->post('/exam/update/{id}', [ExamController::class, 'update']);
        $router->post('/exam/delete/{id}', [ExamController::class, 'delete']);
        
        // Question Management
        $router->post('/exam/{id}/add-question', [ExamController::class, 'addQuestion']);
        $router->post('/exam/question/{id}/update', [ExamController::class, 'updateQuestion']);
        $router->post('/exam/question/{id}/delete', [ExamController::class, 'deleteQuestion']);
        
        // Results Management
        $router->get('/exam/results', [ExamController::class, 'allResults']);
        $router->post('/exam/result/{id}/approve', [ExamController::class, 'approveResult']);
    });
});

// ===== Payment System Routes =====
$router->group(['middleware' => 'auth'], function($router) {
    // Payment Dashboard
    $router->get('/payment/dashboard', [PaymentController::class, 'dashboard']);
    
    // Payment Upload (All authenticated users)
    $router->get('/payment/upload', [PaymentController::class, 'upload']);
    $router->post('/payment/store', [PaymentController::class, 'store']);
    $router->get('/payment/view/{id}', [PaymentController::class, 'view']);
    
    // Finance Dashboard (Super Admin only)
    $router->group(['middleware' => 'role:superadmin'], function($router) {
        $router->get('/payment/finance', [PaymentController::class, 'finance']);
        $router->post('/payment/verify/{id}', [PaymentController::class, 'verify']);
        $router->get('/payment/reports', [PaymentController::class, 'reports']);
        $router->get('/payment/export', [PaymentController::class, 'export']);
    });
});

// ===== Notification System Routes =====
$router->group(['middleware' => 'auth'], function($router) {
    // Notification Dashboard
    $router->get('/notification/dashboard', [NotificationController::class, 'dashboard']);
    $router->get('/notifications', [NotificationController::class, 'getNotifications']); // API endpoint
    
    // Notification Actions
    $router->post('/notification/mark-read/{id}', [NotificationController::class, 'markAsRead']);
    $router->post('/notification/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    $router->post('/notification/delete/{id}', [NotificationController::class, 'delete']);
    
    // Send Notifications (Admin only)
    $router->group(['middleware' => 'role:admin'], function($router) {
        $router->get('/notification/create', [NotificationController::class, 'create']);
        $router->post('/notification/store', [NotificationController::class, 'store']);
        $router->get('/notification/manage', [NotificationController::class, 'manage']);
    });
});

// ===== Camp Registration Routes =====
$router->group(['middleware' => 'auth'], function($router) {
    // Camp Dashboard
    $router->get('/camp/dashboard', [CampController::class, 'dashboard']);
    
    // Camp Registration Upload (Association Presidents only)
    $router->group(['middleware' => 'role:president'], function($router) {
        $router->get('/camp/upload', [CampController::class, 'upload']);
        $router->post('/camp/store', [CampController::class, 'store']);
    });
    
    // Camp Registration Review (Super Admin only)
    $router->group(['middleware' => 'role:superadmin'], function($router) {
        $router->get('/camp/review/{id}', [CampController::class, 'review']);
        $router->post('/camp/process-review/{id}', [CampController::class, 'processReview']);
        $router->get('/camp/reports', [CampController::class, 'reports']);
    });
    
    // File Download (Permission-based)
    $router->get('/camp/download/{id}', [CampController::class, 'download']);
});

// ===== API Routes =====
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function($router) {
    // Session Management
    $router->post('/session/extend', function() {
        $sessionManager = \App\Core\SessionManager::getInstance();
        $result = $sessionManager->extendSession();
        echo json_encode(['success' => $result]);
    });
    
    $router->get('/session/status', function() {
        $sessionManager = \App\Core\SessionManager::getInstance();
        echo json_encode([
            'authenticated' => $sessionManager->isAuthenticated(),
            'user' => $sessionManager->getUser(),
            'should_extend' => $sessionManager->shouldExtendSession()
        ]);
    });
    
    // Notifications API
    $router->get('/notifications', [NotificationController::class, 'getNotifications']);
    $router->get('/notifications/count', function() {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        $count = DB::fetchOne("
            SELECT COUNT(*) as count
            FROM notifications
            WHERE is_read = 0 AND (
                recipient_id = ? OR 
                (recipient_type = ? AND recipient_id IS NULL) OR
                recipient_type = 'all'
            )
        ", [$userId, $userRole])['count'] ?? 0;
        
        echo json_encode(['count' => $count]);
    });
    
    // Payment Statistics API
    $router->get('/payment/stats', [PaymentController::class, 'getStats']);
    
    // Exam Statistics API
    $router->get('/exam/stats', [ExamController::class, 'getStats']);
    
    // Camp Statistics API
    $router->get('/camp/stats', [CampController::class, 'getStats']);
});

// ===== File Serving Routes =====
$router->get('/uploads/{type}/{file}', function($type, $file) {
    $allowedTypes = ['receipts', 'camp_files', 'profile_pictures'];
    
    if (!in_array($type, $allowedTypes)) {
        http_response_code(404);
        exit;
    }
    
    $filePath = "uploads/{$type}/{$file}";
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        exit;
    }
    
    // Security check - ensure user has permission to access file
    $sessionManager = \App\Core\SessionManager::getInstance();
    if (!$sessionManager->isAuthenticated()) {
        http_response_code(401);
        exit;
    }
    
    // Serve file with appropriate headers
    $mimeType = mime_content_type($filePath);
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($filePath));
    
    // For images, allow inline display
    if (strpos($mimeType, 'image/') === 0) {
        header('Content-Disposition: inline; filename="' . basename($file) . '"');
    } else {
        header('Content-Disposition: attachment; filename="' . basename($file) . '"');
    }
    
    readfile($filePath);
    exit;
});

// ===== Legacy Portal Integration Routes =====
// These routes provide seamless integration with existing portal structure

// Super Admin Portal Integration
$router->group(['middleware' => 'role:superadmin'], function($router) {
    $router->get('/admin/*', function($path = '') {
        // Redirect to appropriate ADMIN directory file
        $file = $path ?: 'dashboard.php';
        if (file_exists("ADMIN/{$file}")) {
            include "ADMIN/{$file}";
        } else {
            http_response_code(404);
            echo "Admin page not found";
        }
    });
});

// Association President Portal Integration
$router->group(['middleware' => 'role:president'], function($router) {
    $router->get('/president/*', function($path = '') {
        $file = $path ?: 'dashboard.php';
        if (file_exists("association-president/{$file}")) {
            include "association-president/{$file}";
        } else {
            http_response_code(404);
            echo "President page not found";
        }
    });
});

// Ambassador Portal Integration
$router->group(['middleware' => 'role:ambassador'], function($router) {
    $router->get('/ambassador/*', function($path = '') {
        $file = $path ?: 'dashboard.php';
        if (file_exists("ambassador/{$file}")) {
            include "ambassador/{$file}";
        } else {
            http_response_code(404);
            echo "Ambassador page not found";
        }
    });
});

// ===== Error Handling Routes =====
$router->get('/403', function() {
    http_response_code(403);
    echo "Access Denied";
});

$router->get('/404', function() {
    http_response_code(404);
    echo "Page Not Found";
});

$router->get('/500', function() {
    http_response_code(500);
    echo "Internal Server Error";
});

// Handle 404 for undefined routes
$router->setNotFoundHandler(function() {
    http_response_code(404);
    include 'app/Views/errors/404.php';
});

return $router;