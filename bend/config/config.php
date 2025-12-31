<?php
/**
 * Environment Configuration Loader
 * Loads configuration from .env file for production deployment
 */

// Load .env file if it exists
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Skip comments
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                $value = $matches[2];
            }
            
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Load environment variables
loadEnv(dirname(__DIR__) . '/.env');

// Database Configuration
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'ra_ogbc_portal');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// Application Configuration
define('APP_NAME', $_ENV['APP_NAME'] ?? 'Royal Ambassadors OGBC Portal');
define('APP_ENV', $_ENV['APP_ENV'] ?? 'production');
define('APP_KEY', $_ENV['APP_KEY'] ?? 'production-key-' . bin2hex(random_bytes(16)));

// Base URL Configuration for production
function getBaseUrl() {
    if (isset($_ENV['BASE_URL']) && !empty($_ENV['BASE_URL'])) {
        return rtrim($_ENV['BASE_URL'], '/');
    }
    
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // For production, assume domain points to public folder
    return $protocol . '://' . $host;
}

define('BASE_URL', getBaseUrl());

// Security Configuration
define('SESSION_TIMEOUT', 3600); // 1 hour
define('CSRF_TOKEN_EXPIRY', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('ACCOUNT_LOCKOUT_TIME', 900); // 15 minutes
define('REMEMBER_TOKEN_EXPIRY', 2592000); // 30 days

// Two-Factor Authentication
define('TOTP_ISSUER', APP_NAME);
define('TOTP_PERIOD', 30);
define('TOTP_DIGITS', 6);

// File Upload Configuration
define('MAX_FILE_SIZE', (int)($_ENV['MAX_FILE_SIZE'] ?? 5242880)); // 5MB
define('ALLOWED_IMAGE_TYPES', $_ENV['ALLOWED_IMAGE_TYPES'] ?? 'jpg,jpeg,png,gif');
define('ALLOWED_DOC_TYPES', $_ENV['ALLOWED_DOC_TYPES'] ?? 'pdf,doc,docx');

// Super Admin Configuration
define('SUPER_ADMIN_PASSCODE', $_ENV['SUPER_ADMIN_PASSCODE'] ?? 'RABCN2024OGBC');
define('PRESIDENT_PASSCODE', $_ENV['PRESIDENT_PASSCODE'] ?? 'RABCNPRES2024');

// Production-specific settings
if (APP_ENV === 'production') {
    // Security headers
    define('FORCE_HTTPS', true);
    define('HSTS_MAX_AGE', 31536000); // 1 year
    
    // Error logging
    define('LOG_ERRORS', true);
    define('DISPLAY_ERRORS', false);
    
    // Session security for production
    ini_set('session.cookie_secure', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', 1);
} else {
    // Development settings
    define('FORCE_HTTPS', false);
    define('LOG_ERRORS', true);
    define('DISPLAY_ERRORS', true);
}