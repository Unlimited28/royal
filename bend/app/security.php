<?php
/**
 * Security Initialization and Protection Measures
 */

// Security Headers
if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}

// Session Security
if (session_status() === PHP_SESSION_ACTIVE) {
    // Regenerate session ID on login/privilege change
    if (isset($_SESSION['regenerate_id']) && $_SESSION['regenerate_id'] === true) {
        session_regenerate_id(true);
        unset($_SESSION['regenerate_id']);
    }
    
    // Check for session hijacking
    $currentFingerprint = hash('sha256', 
        $_SERVER['HTTP_USER_AGENT'] . 
        $_SERVER['REMOTE_ADDR'] . 
        ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '')
    );
    
    if (isset($_SESSION['fingerprint'])) {
        if ($_SESSION['fingerprint'] !== $currentFingerprint) {
            session_unset();
            session_destroy();
            log_security_event('session_hijack', 'Session fingerprint mismatch', null, [
                'expected' => $_SESSION['fingerprint'] ?? 'none',
                'received' => $currentFingerprint
            ]);
            redirect('/login?security_error=1');
        }
    } else {
        $_SESSION['fingerprint'] = $currentFingerprint;
    }
}

// Rate Limiting
class RateLimiter {
    private static $limits = [];
    
    public static function check($key, $maxAttempts, $timeWindow = 60) {
        $now = time();
        $windowStart = $now - $timeWindow;
        
        // Clean old entries
        if (isset(self::$limits[$key])) {
            self::$limits[$key] = array_filter(self::$limits[$key], function($timestamp) use ($windowStart) {
                return $timestamp > $windowStart;
            });
        } else {
            self::$limits[$key] = [];
        }
        
        // Check if limit exceeded
        if (count(self::$limits[$key]) >= $maxAttempts) {
            log_security_event('rate_limit_exceeded', "Rate limit exceeded for key: {$key}", null, [
                'key' => $key,
                'attempts' => count(self::$limits[$key]),
                'limit' => $maxAttempts,
                'window' => $timeWindow
            ]);
            return false;
        }
        
        // Add current attempt
        self::$limits[$key][] = $now;
        return true;
    }
    
    public static function reset($key) {
        unset(self::$limits[$key]);
    }
}

// Account Lockout Management
class AccountLockout {
    public static function isLocked($identifier) {
        $lockout = DB::fetchOne(
            "SELECT * FROM account_lockouts WHERE identifier = ? AND locked_until > NOW()",
            [$identifier]
        );
        
        return $lockout !== false;
    }
    
    public static function recordFailedAttempt($identifier) {
        $attempts = DB::fetchOne(
            "SELECT attempts FROM login_attempts WHERE identifier = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
            [$identifier]
        );
        
        $currentAttempts = $attempts ? $attempts['attempts'] + 1 : 1;
        
        // Update or insert attempt record
        DB::query(
            "INSERT INTO login_attempts (identifier, attempts, created_at) 
             VALUES (?, ?, NOW()) 
             ON DUPLICATE KEY UPDATE attempts = ?, created_at = NOW()",
            [$identifier, $currentAttempts, $currentAttempts]
        );
        
        // Lock account if max attempts reached
        if ($currentAttempts >= MAX_LOGIN_ATTEMPTS) {
            $lockedUntil = date('Y-m-d H:i:s', time() + ACCOUNT_LOCKOUT_TIME);
            
            DB::query(
                "INSERT INTO account_lockouts (identifier, locked_until, created_at) 
                 VALUES (?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE locked_until = ?, created_at = NOW()",
                [$identifier, $lockedUntil, $lockedUntil]
            );
            
            log_security_event('account_locked', "Account locked due to failed login attempts", null, [
                'identifier' => $identifier,
                'attempts' => $currentAttempts
            ]);
            
            return true;
        }
        
        return false;
    }
    
    public static function clearFailedAttempts($identifier) {
        DB::query("DELETE FROM login_attempts WHERE identifier = ?", [$identifier]);
        DB::query("DELETE FROM account_lockouts WHERE identifier = ?", [$identifier]);
    }
}

// Input Validation and Sanitization
class Validator {
    private $errors = [];
    
    public function validate($data, $rules) {
        $this->errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $fieldRules = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;
            
            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }
        
        return empty($this->errors);
    }
    
    public function getErrors() {
        return $this->errors;
    }
    
    private function applyRule($field, $value, $rule) {
        if (strpos($rule, ':') !== false) {
            list($ruleName, $parameter) = explode(':', $rule, 2);
        } else {
            $ruleName = $rule;
            $parameter = null;
        }
        
        switch ($ruleName) {
            case 'required':
                if (empty($value)) {
                    $this->errors[$field][] = "The {$field} field is required.";
                }
                break;
                
            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->errors[$field][] = "The {$field} must be a valid email address.";
                }
                break;
                
            case 'min':
                if (!empty($value) && strlen($value) < $parameter) {
                    $this->errors[$field][] = "The {$field} must be at least {$parameter} characters.";
                }
                break;
                
            case 'max':
                if (!empty($value) && strlen($value) > $parameter) {
                    $this->errors[$field][] = "The {$field} may not be greater than {$parameter} characters.";
                }
                break;
                
            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->errors[$field][] = "The {$field} must be a number.";
                }
                break;
                
            case 'alpha':
                if (!empty($value) && !ctype_alpha($value)) {
                    $this->errors[$field][] = "The {$field} may only contain letters.";
                }
                break;
                
            case 'alphanumeric':
                if (!empty($value) && !ctype_alnum($value)) {
                    $this->errors[$field][] = "The {$field} may only contain letters and numbers.";
                }
                break;
                
            case 'strong_password':
                if (!empty($value) && !is_strong_password($value)) {
                    $this->errors[$field][] = "The {$field} must be at least 8 characters and contain uppercase, lowercase, and numeric characters.";
                }
                break;
                
            case 'unique':
                if (!empty($value)) {
                    list($table, $column) = explode(',', $parameter);
                    $exists = DB::fetchOne("SELECT id FROM {$table} WHERE {$column} = ?", [$value]);
                    if ($exists) {
                        $this->errors[$field][] = "The {$field} has already been taken.";
                    }
                }
                break;
        }
    }
}

// CSRF Protection
class CSRFProtection {
    public static function generateToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            $_SESSION['csrf_token_time'] = time();
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateToken($token) {
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
            return false;
        }
        
        // Check token expiry
        if (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_EXPIRY) {
            unset($_SESSION['csrf_token']);
            unset($_SESSION['csrf_token_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public static function getField() {
        $token = self::generateToken();
        return "<input type='hidden' name='csrf_token' value='{$token}'>";
    }
}

// Two-Factor Authentication
class TwoFactorAuth {
    public static function generateSecret() {
        return bin2hex(random_bytes(16));
    }
    
    public static function generateQRCode($secret, $email) {
        $issuer = urlencode(TOTP_ISSUER);
        $email = urlencode($email);
        return "otpauth://totp/{$issuer}:{$email}?secret={$secret}&issuer={$issuer}";
    }
    
    public static function verifyToken($secret, $token) {
        $timeSlice = floor(time() / TOTP_PERIOD);
        
        // Check current time slice and adjacent ones to account for clock drift
        for ($i = -1; $i <= 1; $i++) {
            $calculatedToken = self::calculateToken($secret, $timeSlice + $i);
            if (hash_equals($calculatedToken, $token)) {
                return true;
            }
        }
        
        return false;
    }
    
    private static function calculateToken($secret, $timeSlice) {
        $secretKey = hex2bin($secret);
        $timestamp = pack('N*', 0, $timeSlice);
        $hash = hash_hmac('sha1', $timestamp, $secretKey, true);
        $offset = ord($hash[19]) & 0xf;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        ) % pow(10, TOTP_DIGITS);
        
        return str_pad($code, TOTP_DIGITS, '0', STR_PAD_LEFT);
    }
}

// Remember Me Token Management
class RememberToken {
    public static function generate($userId) {
        $token = bin2hex(random_bytes(32));
        $selector = bin2hex(random_bytes(16));
        $hashedToken = hash('sha256', $token);
        $expiry = date('Y-m-d H:i:s', time() + REMEMBER_TOKEN_EXPIRY);
        
        // Store in database
        DB::query(
            "INSERT INTO remember_tokens (user_id, selector, token, expires_at) VALUES (?, ?, ?, ?)",
            [$userId, $selector, $hashedToken, $expiry]
        );
        
        // Set cookie
        $cookieValue = $selector . ':' . $token;
        setcookie('remember_token', $cookieValue, time() + REMEMBER_TOKEN_EXPIRY, '/', '', true, true);
        
        return $cookieValue;
    }
    
    public static function validate($cookieValue) {
        if (!$cookieValue || strpos($cookieValue, ':') === false) {
            return false;
        }
        
        list($selector, $token) = explode(':', $cookieValue, 2);
        
        $stored = DB::fetchOne(
            "SELECT * FROM remember_tokens WHERE selector = ? AND expires_at > NOW()",
            [$selector]
        );
        
        if (!$stored) {
            return false;
        }
        
        if (hash_equals($stored['token'], hash('sha256', $token))) {
            // Valid token - refresh it
            self::refresh($stored['user_id'], $selector);
            return $stored['user_id'];
        }
        
        // Invalid token - clean up
        self::revoke($selector);
        return false;
    }
    
    public static function refresh($userId, $oldSelector) {
        // Delete old token
        DB::query("DELETE FROM remember_tokens WHERE selector = ?", [$oldSelector]);
        
        // Generate new token
        return self::generate($userId);
    }
    
    public static function revoke($selector = null) {
        if ($selector) {
            DB::query("DELETE FROM remember_tokens WHERE selector = ?", [$selector]);
        }
        
        // Clear cookie
        setcookie('remember_token', '', time() - 3600, '/', '', true, true);
    }
    
    public static function revokeAll($userId) {
        DB::query("DELETE FROM remember_tokens WHERE user_id = ?", [$userId]);
        self::revoke();
    }
}

// Security Event Logger
function log_security_event($type, $description, $userId = null, $data = null) {
    $ipAddress = get_client_ip();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    // Create security_logs table if not exists
    DB::query("
        CREATE TABLE IF NOT EXISTS security_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            user_agent TEXT,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_type (type),
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at)
        )
    ");
    
    DB::query(
        "INSERT INTO security_logs (user_id, type, description, ip_address, user_agent, data, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [$userId, $type, $description, $ipAddress, $userAgent, json_encode($data)]
    );
}

// Initialize security tables if they don't exist
try {
    // Login attempts table
    DB::query("
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            attempts INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_identifier (identifier)
        )
    ");
    
    // Account lockouts table
    DB::query("
        CREATE TABLE IF NOT EXISTS account_lockouts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            locked_until TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_identifier (identifier)
        )
    ");
    
    // Remember tokens table
    DB::query("
        CREATE TABLE IF NOT EXISTS remember_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            selector VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_selector (selector),
            INDEX idx_user_id (user_id),
            INDEX idx_expires_at (expires_at)
        )
    ");
    
    // Activity logs table
    DB::query("
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            data JSON,
            ip_address VARCHAR(45) NOT NULL,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_type (type),
            INDEX idx_created_at (created_at)
        )
    ");
    
} catch (Exception $e) {
    error_log("Failed to create security tables: " . $e->getMessage());
}