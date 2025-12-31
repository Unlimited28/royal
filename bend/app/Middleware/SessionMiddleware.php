<?php

namespace App\Middleware;

/**
 * Centralized Session Management Middleware
 * Handles session security, regeneration, and lockout functionality
 */
class SessionMiddleware {
    
    private static $initialized = false;
    private static $maxLoginAttempts = 5;
    private static $lockoutDuration = 15 * 60; // 15 minutes
    
    /**
     * Initialize secure session (call once per request)
     */
    public static function init() {
        if (self::$initialized) {
            return;
        }
        
        // Configure session security settings
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
        ini_set('session.use_strict_mode', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_samesite', 'Strict');
        
        // Set session name
        session_name('MGTH_SESSION');
        
        // Start session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID periodically
        self::regenerateSessionId();
        
        self::$initialized = true;
    }
    
    /**
     * Regenerate session ID for security
     */
    private static function regenerateSessionId() {
        // Regenerate every 30 minutes or on login
        $regenerateInterval = 30 * 60; // 30 minutes
        
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
            session_regenerate_id(true);
        } elseif (time() - $_SESSION['last_regeneration'] > $regenerateInterval) {
            $_SESSION['last_regeneration'] = time();
            session_regenerate_id(true);
        }
    }
    
    /**
     * Handle login attempt and check for lockout
     */
    public static function handleLoginAttempt($identifier, $success = false) {
        $key = 'login_attempts_' . md5($identifier . $_SERVER['REMOTE_ADDR']);
        
        if ($success) {
            // Clear attempts on successful login
            unset($_SESSION[$key]);
            unset($_SESSION[$key . '_lockout']);
            
            // Regenerate session ID on login
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
            
            return true;
        }
        
        // Check if currently locked out
        if (self::isLockedOut($identifier)) {
            return false;
        }
        
        // Increment failed attempts
        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = ['count' => 0, 'first_attempt' => time()];
        }
        
        $_SESSION[$key]['count']++;
        $_SESSION[$key]['last_attempt'] = time();
        
        // Check if should be locked out
        if ($_SESSION[$key]['count'] >= self::$maxLoginAttempts) {
            $_SESSION[$key . '_lockout'] = time();
            
            // Log security event
            self::logSecurityEvent('LOGIN_LOCKOUT', [
                'identifier' => $identifier,
                'ip' => $_SERVER['REMOTE_ADDR'],
                'attempts' => $_SESSION[$key]['count']
            ]);
            
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if identifier is currently locked out
     */
    public static function isLockedOut($identifier) {
        $key = 'login_attempts_' . md5($identifier . $_SERVER['REMOTE_ADDR']);
        $lockoutKey = $key . '_lockout';
        
        if (!isset($_SESSION[$lockoutKey])) {
            return false;
        }
        
        // Check if lockout period has expired
        if (time() - $_SESSION[$lockoutKey] > self::$lockoutDuration) {
            unset($_SESSION[$key]);
            unset($_SESSION[$lockoutKey]);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get remaining lockout time in seconds
     */
    public static function getRemainingLockoutTime($identifier) {
        if (!self::isLockedOut($identifier)) {
            return 0;
        }
        
        $key = 'login_attempts_' . md5($identifier . $_SERVER['REMOTE_ADDR']);
        $lockoutKey = $key . '_lockout';
        
        return self::$lockoutDuration - (time() - $_SESSION[$lockoutKey]);
    }
    
    /**
     * Get failed login attempts count
     */
    public static function getFailedAttempts($identifier) {
        $key = 'login_attempts_' . md5($identifier . $_SERVER['REMOTE_ADDR']);
        
        if (!isset($_SESSION[$key])) {
            return 0;
        }
        
        return $_SESSION[$key]['count'];
    }
    
    /**
     * Log security events
     */
    private static function logSecurityEvent($event, $data = []) {
        try {
            $logData = [
                'timestamp' => date('Y-m-d H:i:s'),
                'event' => $event,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'session_id' => session_id(),
                'data' => $data
            ];
            
            // Log to database if available
            if (class_exists('\App\Core\DB')) {
                try {
                    \App\Core\DB::insert(
                        "INSERT INTO system_logs (event_type, ip_address, user_agent, session_id, event_data, created_at) 
                         VALUES (?, ?, ?, ?, ?, NOW())",
                        [
                            $event,
                            $logData['ip'],
                            $logData['user_agent'],
                            $logData['session_id'],
                            json_encode($data)
                        ]
                    );
                } catch (\Exception $e) {
                    // Fallback to file logging if database fails
                    error_log("Security Event: " . json_encode($logData));
                }
            } else {
                // Log to file
                error_log("Security Event: " . json_encode($logData));
            }
            
        } catch (\Exception $e) {
            error_log("Failed to log security event: " . $e->getMessage());
        }
    }
    
    /**
     * Destroy session securely
     */
    public static function destroy() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params["path"], $params["domain"],
                    $params["secure"], $params["httponly"]
                );
            }
            
            session_destroy();
        }
        
        self::$initialized = false;
    }
}