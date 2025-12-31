<?php
/**
 * Authentication and Session Management
 * Enhanced security for user authentication and session handling
 */

require_once __DIR__ . '/security.php';
require_once __DIR__ . '/error_handler.php';
require_once __DIR__ . '/../config/database.php';

class AuthManager {
    
    /**
     * Check if user is authenticated
     */
    public static function isAuthenticated() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if user is logged in
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
            return false;
        }
        
        // Check session timeout
        if (time() - $_SESSION['login_time'] > SESSION_TIMEOUT) {
            self::logout();
            return false;
        }
        
        // Update last activity time
        $_SESSION['login_time'] = time();
        
        return true;
    }
    
    /**
     * Check if user has required role
     */
    public static function hasRole($requiredRole) {
        if (!self::isAuthenticated()) {
            return false;
        }
        
        $userRole = $_SESSION['user_role'] ?? '';
        
        // Super admin has access to everything
        if ($userRole === 'super_admin') {
            return true;
        }
        
        // Check specific role
        return $userRole === $requiredRole;
    }
    
    /**
     * Require authentication
     */
    public static function requireAuth($redirectTo = '/public/login.php') {
        if (!self::isAuthenticated()) {
            header('Location: ' . $redirectTo);
            exit();
        }
    }
    
    /**
     * Require specific role
     */
    public static function requireRole($requiredRole, $redirectTo = '/public/login.php') {
        if (!self::hasRole($requiredRole)) {
            ErrorHandler::logSecurity('Unauthorized access attempt', [
                'required_role' => $requiredRole,
                'user_role' => $_SESSION['user_role'] ?? 'none',
                'user_id' => $_SESSION['user_id'] ?? 'none',
                'ip' => SecurityManager::getClientIP()
            ]);
            header('Location: ' . $redirectTo);
            exit();
        }
    }
    
    /**
     * Get current user info
     */
    public static function getCurrentUser() {
        if (!self::isAuthenticated()) {
            return null;
        }
        
        try {
            $sql = 'SELECT id, unique_id, full_name, email, role, association_id, rank_id FROM users WHERE id = ?';
            return DB::fetchOne($sql, [$_SESSION['user_id']]);
        } catch (Exception $e) {
            ErrorHandler::logError('Failed to get current user: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Logout user
     */
    public static function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Log logout
        if (isset($_SESSION['user_id'])) {
            ErrorHandler::logError('User logged out', [
                'user_id' => $_SESSION['user_id'],
                'session_duration' => time() - ($_SESSION['login_time'] ?? time())
            ]);
        }
        
        // Clear session data
        $_SESSION = [];
        
        // Destroy session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy session
        session_destroy();
    }
    
    /**
     * Check password strength during password change
     */
    public static function changePassword($userId, $currentPassword, $newPassword) {
        try {
            // Get current user
            $user = DB::fetchOne('SELECT password FROM users WHERE id = ?', [$userId]);
            if (!$user) {
                throw new Exception('User not found');
            }
            
            // Verify current password
            if (!password_verify($currentPassword, $user['password'])) {
                throw new Exception('Current password is incorrect');
            }
            
            // Validate new password strength
            $passwordValidation = SecurityManager::validatePassword($newPassword);
            if ($passwordValidation !== true) {
                throw new Exception('New password does not meet requirements: ' . implode(', ', $passwordValidation));
            }
            
            // Hash new password
            $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Update password
            DB::query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [$newPasswordHash, $userId]);
            
            // Log password change
            ErrorHandler::logSecurity('Password changed', ['user_id' => $userId]);
            
            return true;
            
        } catch (Exception $e) {
            ErrorHandler::logError('Password change failed: ' . $e->getMessage(), ['user_id' => $userId]);
            throw $e;
        }
    }
}
?>