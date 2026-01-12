<?php

namespace App\Core;

/**
 * Enhanced Session Management System
 * Cross-portal session handling with security features
 */
class SessionManager {
    
    private static $instance = null;
    private $sessionTimeout = 3600; // 1 hour
    private $regenerateInterval = 300; // 5 minutes
    
    /**
     * Singleton instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Initialize secure session
     */
    public function start() {
        // Configure session security
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', $this->isHttps());
        ini_set('session.use_strict_mode', 1);
        ini_set('session.cookie_samesite', 'Strict');
        
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Security checks
        $this->validateSession();
        $this->regenerateIdIfNeeded();
        
        return true;
    }
    
    /**
     * Validate current session
     */
    private function validateSession() {
        // Check session timeout
        if (isset($_SESSION['last_activity'])) {
            $inactive = time() - $_SESSION['last_activity'];
            
            if ($inactive > $this->sessionTimeout) {
                $this->destroy();
                header('Location: /login?timeout=1');
                exit;
            }
        }
        
        // Check IP address consistency (security measure)
        if (isset($_SESSION['ip_address'])) {
            if ($_SESSION['ip_address'] !== $this->getClientIp()) {
                log_security_event('session_hijack_attempt', 'IP address mismatch detected', $_SESSION['user_id'] ?? null);
                $this->destroy();  
                header('Location: /login?security_error=1');
                exit;
            }
        }
        
        // Check user agent consistency
        if (isset($_SESSION['user_agent'])) {
            if ($_SESSION['user_agent'] !== ($_SERVER['HTTP_USER_AGENT'] ?? '')) {
                log_security_event('session_hijack_attempt', 'User agent mismatch detected', $_SESSION['user_id'] ?? null);
                $this->destroy();
                header('Location: /login?security_error=1');
                exit;
            }
        }
        
        // Update last activity
        $_SESSION['last_activity'] = time();
    }
    
    /**
     * Regenerate session ID if needed
     */
    private function regenerateIdIfNeeded() {
        if (!isset($_SESSION['regenerate_time']) || 
            (time() - $_SESSION['regenerate_time']) > $this->regenerateInterval) {
            
            session_regenerate_id(true);
            $_SESSION['regenerate_time'] = time();
        }
    }
    
    /**
     * Create authenticated session
     */
    public function createSession($user) {
        // Regenerate session ID for security
        session_regenerate_id(true);
        
        // Set session data
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['association_id'] = $user['association_id'];
        $_SESSION['unique_id'] = $user['unique_id'];
        
        // Security tracking
        $_SESSION['ip_address'] = $this->getClientIp();
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        $_SESSION['regenerate_time'] = time();
        
        // Store session in database for tracking
        $this->storeSessionInDB($user['id']);
        
        return true;
    }
    
    /**
     * Store session in database
     */
    private function storeSessionInDB($userId) {
        try {
            // Clean old sessions for this user
            DB::execute("DELETE FROM user_sessions WHERE user_id = ?", [$userId]);
            
            // Insert new session
            DB::insert("
                INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at)
                VALUES (?, ?, ?, ?, NOW())
            ", [
                session_id(),
                $userId,
                $this->getClientIp(),
                $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]);
            
        } catch (Exception $e) {
            error_log("Session storage error: " . $e->getMessage());
        }
    }
    
    /**
     * Check if user is authenticated
     */
    public function isAuthenticated() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Get current user data
     */
    public function getUser() {
        if (!$this->isAuthenticated()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['user_id'],
            'role' => $_SESSION['user_role'],
            'email' => $_SESSION['user_email'],
            'full_name' => $_SESSION['full_name'],
            'association_id' => $_SESSION['association_id'] ?? null,
            'unique_id' => $_SESSION['unique_id'] ?? null
        ];
    }
    
    /**
     * Check if user has specific role
     */
    public function hasRole($roles) {
        if (!$this->isAuthenticated()) {
            return false;
        }
        
        $userRole = $_SESSION['user_role'];
        
        if (is_array($roles)) {
            return in_array($userRole, $roles);
        }
        
        return $userRole === $roles;
    }
    
    /**
     * Check role hierarchy permission
     */
    public function hasPermission($requiredRole) {
        if (!$this->isAuthenticated()) {
            return false;
        }
        
        $hierarchy = [
            'ambassador' => 1,
            'president' => 2,
            'admin' => 3,
            'superadmin' => 4
        ];
        
        $userLevel = $hierarchy[$_SESSION['user_role']] ?? 0;
        $requiredLevel = $hierarchy[$requiredRole] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }
    
    /**
     * Destroy session
     */
    public function destroy() {
        if ($this->isAuthenticated()) {
            // Remove from database
            try {
                DB::execute("DELETE FROM user_sessions WHERE id = ?", [session_id()]);
            } catch (Exception $e) {
                error_log("Session cleanup error: " . $e->getMessage());
            }
        }
        
        // Clear session data
        $_SESSION = [];
        
        // Delete session cookie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        // Destroy session
        session_destroy();
    }
    
    /**
     * Cross-portal redirection based on role
     */
    public function redirectToDashboard() {
        if (!$this->isAuthenticated()) {
            header('Location: /login');
            exit;
        }
        
        $role = $_SESSION['user_role'];
        
        switch ($role) {
            case 'superadmin':
                header('Location: /ADMIN/dashboard.php');
                break;
                
            case 'president':
                header('Location: /association-president/dashboard.php');
                break;
                
            case 'ambassador':
            default:
                header('Location: /ambassador/dashboard.php');
                break;
        }
        exit;
    }
    
    /**
     * Get role-specific navigation
     */
    public function getRoleNavigation() {
        if (!$this->isAuthenticated()) {
            return [];
        }
        
        $role = $_SESSION['user_role'];
        $navigation = [];
        
        switch ($role) {
            case 'superadmin':
                $navigation = [
                    'Dashboard' => '/ADMIN/dashboard.php',
                    'User Management' => '/ADMIN/user-management.php',
                    'Exam Management' => '/ADMIN/exam-management.php',
                    'Finance Dashboard' => '/ADMIN/finance_dashboard.php',
                    'Notifications' => '/ADMIN/notification-management.php',
                    'System Settings' => '/ADMIN/system_settings.php'
                ];
                break;
                
            case 'president':
                $navigation = [
                    'Dashboard' => '/association-president/dashboard.php',
                    'Camp Registration' => '/association-president/camp_registration.php',
                    'Payment Tracking' => '/association-president/payment_tracking.php',
                    'Member Management' => '/association-president/member_management.php',
                    'Reports' => '/association-president/reports.php'
                ];
                break;
                
            case 'ambassador':
                $navigation = [
                    'Dashboard' => '/ambassador/dashboard.php',
                    'Exams' => '/ambassador/exams.php',
                    'Payments' => '/ambassador/payments.php',
                    'Profile' => '/ambassador/profile.php',
                    'Notifications' => '/ambassador/notifications.php'
                ];
                break;
        }
        
        return $navigation;
    }
    
    /**
     * Clean expired sessions
     */
    public function cleanExpiredSessions() {
        try {
            $expiredTime = time() - $this->sessionTimeout;
            
            DB::execute("
                DELETE FROM user_sessions 
                WHERE last_activity < FROM_UNIXTIME(?)
            ", [$expiredTime]);
            
        } catch (Exception $e) {
            error_log("Session cleanup error: " . $e->getMessage());
        }
    }
    
    /**
     * Get active sessions for user
     */
    public function getActiveSessions($userId) {
        return DB::fetchAll("
            SELECT id, ip_address, user_agent, last_activity, created_at
            FROM user_sessions 
            WHERE user_id = ? 
            ORDER BY last_activity DESC
        ", [$userId]);
    }
    
    /**
     * Kill specific session
     */
    public function killSession($sessionId, $userId) {
        return DB::execute("
            DELETE FROM user_sessions 
            WHERE id = ? AND user_id = ?
        ", [$sessionId, $userId]);
    }
    
    /**
     * Kill all other sessions for user
     */
    public function killOtherSessions($userId) {
        return DB::execute("
            DELETE FROM user_sessions 
            WHERE user_id = ? AND id != ?
        ", [$userId, session_id()]);
    }
    
    /**
     * Get client IP address
     */
    private function getClientIp() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Check if connection is HTTPS
     */
    private function isHttps() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
               $_SERVER['SERVER_PORT'] == 443 ||
               (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    }
    
    /**
     * Set flash message
     */
    public function setFlash($message, $type = 'info') {
        $_SESSION['flash_messages'][] = [
            'message' => $message,
            'type' => $type,
            'timestamp' => time()
        ];
    }
    
    /**
     * Get and clear flash messages
     */
    public function getFlashMessages() {
        $messages = $_SESSION['flash_messages'] ?? [];
        unset($_SESSION['flash_messages']);
        return $messages;
    }
    
    /**
     * Check if session should be extended
     */
    public function shouldExtendSession() {
        if (!$this->isAuthenticated()) {
            return false;
        }
        
        $lastActivity = $_SESSION['last_activity'] ?? 0;
        $timeLeft = $this->sessionTimeout - (time() - $lastActivity);
        
        // Extend if less than 10 minutes remaining
        return $timeLeft < 600;
    }
    
    /**
     * Extend session
     */
    public function extendSession() {
        if ($this->isAuthenticated()) {
            $_SESSION['last_activity'] = time();
            
            // Update database
            try {
                DB::execute("
                    UPDATE user_sessions 
                    SET last_activity = NOW() 
                    WHERE id = ?
                ", [session_id()]);
            } catch (Exception $e) {
                error_log("Session extension error: " . $e->getMessage());
            }
            
            return true;
        }
        
        return false;
    }
}