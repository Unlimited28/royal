<?php
/**
 * Security Utilities and Input Validation
 * Centralized security functions for the Royal Ambassadors Portal
 */

class SecurityManager {
    private static $rateLimitTable = 'login_attempts';
    
    /**
     * Initialize security settings and create necessary tables
     */
    public static function init() {
        // Create login attempts table if it doesn't exist
        self::createLoginAttemptsTable();
        
        // Set secure session settings
        self::setSecureSessionSettings();
        
        // Force HTTPS in production
        if (defined('FORCE_HTTPS') && FORCE_HTTPS && !self::isHttps()) {
            self::forceHttps();
        }
    }
    
    /**
     * Create login attempts table for rate limiting
     */
    private static function createLoginAttemptsTable() {
        try {
            $sql = "CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                email VARCHAR(255),
                attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT FALSE,
                INDEX idx_ip_time (ip_address, attempt_time),
                INDEX idx_email_time (email, attempt_time)
            )";
            DB::query($sql);
        } catch (Exception $e) {
            error_log("Failed to create login_attempts table: " . $e->getMessage());
        }
    }
    
    /**
     * Set secure session settings
     */
    private static function setSecureSessionSettings() {
        if (session_status() === PHP_SESSION_NONE) {
            // Set secure session parameters
            ini_set('session.cookie_httponly', 1);
            ini_set('session.use_only_cookies', 1);
            ini_set('session.cookie_samesite', 'Strict');
            
            if (self::isHttps()) {
                ini_set('session.cookie_secure', 1);
            }
            
            session_start();
        }
    }
    
    /**
     * Check if connection is HTTPS
     */
    private static function isHttps() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
               $_SERVER['SERVER_PORT'] == 443 ||
               (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    }
    
    /**
     * Force HTTPS redirect
     */
    private static function forceHttps() {
        $redirectURL = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        header("Location: $redirectURL", true, 301);
        exit();
    }
    
    /**
     * Validate and sanitize input data
     */
    public static function validateInput($data, $type = 'string', $options = []) {
        $data = trim($data);
        
        switch ($type) {
            case 'email':
                return filter_var($data, FILTER_VALIDATE_EMAIL) ? 
                       filter_var($data, FILTER_SANITIZE_EMAIL) : false;
                       
            case 'int':
                return filter_var($data, FILTER_VALIDATE_INT, $options);
                
            case 'float':
                return filter_var($data, FILTER_VALIDATE_FLOAT, $options);
                
            case 'url':
                return filter_var($data, FILTER_VALIDATE_URL) ? 
                       filter_var($data, FILTER_SANITIZE_URL) : false;
                       
            case 'phone':
                $phone = preg_replace('/[^0-9+\-\(\)\s]/', '', $data);
                return strlen($phone) >= 10 ? $phone : false;
                
            case 'name':
                return preg_match('/^[a-zA-Z\s\-\'\.]+$/', $data) ? 
                       htmlspecialchars($data, ENT_QUOTES, 'UTF-8') : false;
                       
            case 'alphanumeric':
                return preg_match('/^[a-zA-Z0-9]+$/', $data) ? $data : false;
                
            case 'string':
            default:
                return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
    }
    
    /**
     * Validate password strength
     */
    public static function validatePassword($password) {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return empty($errors) ? true : $errors;
    }
    
    /**
     * Check rate limiting for login attempts
     */
    public static function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 900) {
        $ip = self::getClientIP();
        $currentTime = date('Y-m-d H:i:s');
        $windowStart = date('Y-m-d H:i:s', time() - $timeWindow);
        
        // Count failed attempts in the time window
        $sql = "SELECT COUNT(*) as attempt_count FROM login_attempts 
                WHERE (ip_address = ? OR email = ?) 
                AND success = FALSE 
                AND attempt_time >= ?";
        
        $result = DB::fetchOne($sql, [$ip, $identifier, $windowStart]);
        $attemptCount = $result['attempt_count'] ?? 0;
        
        return $attemptCount < $maxAttempts;
    }
    
    /**
     * Log login attempt
     */
    public static function logLoginAttempt($identifier, $success = false) {
        $ip = self::getClientIP();
        
        $sql = "INSERT INTO login_attempts (ip_address, email, success) VALUES (?, ?, ?)";
        DB::query($sql, [$ip, $identifier, $success ? 1 : 0]);
        
        // Clean old attempts (older than 24 hours)
        $cleanupTime = date('Y-m-d H:i:s', time() - 86400);
        DB::query("DELETE FROM login_attempts WHERE attempt_time < ?", [$cleanupTime]);
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIP() {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 
                   'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
    
    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }
    
    /**
     * Validate CSRF token
     */
    public static function validateCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check if token has expired (1 hour)
        if (time() - $_SESSION['csrf_token_time'] > 3600) {
            unset($_SESSION['csrf_token'], $_SESSION['csrf_token_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Regenerate session ID for security
     */
    public static function regenerateSession() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }
    }
    
    /**
     * Secure file upload validation
     */
    public static function validateFileUpload($file, $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf'], $maxSize = 2097152) {
        $errors = [];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'File upload failed with error code: ' . $file['error'];
            return $errors;
        }
        
        // Check file size
        if ($file['size'] > $maxSize) {
            $sizeMB = $maxSize / (1024 * 1024);
            $errors[] = "File size exceeds maximum allowed size of {$sizeMB}MB";
        }
        
        // Get file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $allowedTypes)) {
            $errors[] = 'Invalid file type. Allowed types: ' . implode(', ', $allowedTypes);
        }
        
        // Validate MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        $allowedMimes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'pdf' => 'application/pdf'
        ];
        
        if (isset($allowedMimes[$extension]) && $mimeType !== $allowedMimes[$extension]) {
            $errors[] = 'File content does not match file extension';
        }
        
        // Check for executable files
        if (preg_match('/\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi|exe|bat|com)$/i', $file['name'])) {
            $errors[] = 'Potentially dangerous file type detected';
        }
        
        return $errors;
    }
    
    /**
     * Generate secure filename
     */
    public static function generateSecureFilename($originalName) {
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $hash = hash('sha256', $originalName . time() . random_bytes(16));
        return substr($hash, 0, 32) . '.' . $extension;
    }
}

// Initialize security on include
SecurityManager::init();
?>