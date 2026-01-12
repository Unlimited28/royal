<?php
/**
 * Application Configuration
 * XAMPP-optimized settings
 */

// Load environment variables
require_once __DIR__ . '/config.php';

// Environment detection
define('APP_ENV', $_ENV['APP_ENV'] ?? 'development');

// Base URL detection for XAMPP
function detect_base_url() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // Auto-detect if running in subdirectory (common in XAMPP)
    $script_name = $_SERVER['SCRIPT_NAME'] ?? '';
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    // Extract subdirectory from script name
    $subdir = '';
    if (strpos($script_name, '/') !== false) {
        $parts = explode('/', trim($script_name, '/'));
        // Remove 'public' and 'index.php' from path
        $parts = array_filter($parts, function($part) {
            return $part !== 'public' && $part !== 'index.php';
        });
        if (!empty($parts)) {
            $subdir = '/' . implode('/', $parts);
        }
    }
    
    return $protocol . '://' . $host . $subdir;
}

// Set base URL
if (!defined('BASE_URL')) {
    define('BASE_URL', $_ENV['BASE_URL'] ?? detect_base_url());
}

// XAMPP-specific database settings
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'ra_ogbc_portal');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? ''); // XAMPP default is empty password

// Session configuration for XAMPP
ini_set('session.cookie_lifetime', 0);
ini_set('session.cookie_path', '/');
ini_set('session.cookie_domain', '');
ini_set('session.cookie_secure', 0); // Set to 0 for local development
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_samesite', 'Lax'); // More permissive for local dev

// File upload settings for XAMPP
ini_set('upload_max_filesize', '10M');
ini_set('post_max_size', '10M');
ini_set('max_file_uploads', 20);
ini_set('max_execution_time', 300);
ini_set('max_input_time', 300);
ini_set('memory_limit', '256M');

// Error reporting based on environment
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', ROOT_PATH . '/logs/error.log');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', ROOT_PATH . '/logs/error.log');
}

// Timezone setting
date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'America/New_York');

// Create necessary directories for XAMPP
$directories = [
    ROOT_PATH . '/logs',
    ROOT_PATH . '/uploads',
    ROOT_PATH . '/uploads/profiles',
    ROOT_PATH . '/uploads/documents',
    ROOT_PATH . '/uploads/gallery',
    ROOT_PATH . '/uploads/blog',
    ROOT_PATH . '/uploads/camp',
    ROOT_PATH . '/uploads/exams',
    ROOT_PATH . '/uploads/receipts',
    ROOT_PATH . '/uploads/camp_files',
    ROOT_PATH . '/uploads/profile_pictures'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
        
        // Create .htaccess for upload directories
        if (strpos($dir, 'uploads') !== false) {
            file_put_contents($dir . '/.htaccess', "Options -Indexes\nDeny from all\n<Files ~ \"\\.(jpg|jpeg|png|gif|pdf|doc|docx)$\">\n    Allow from all\n</Files>");
        }
    }
}

// XAMPP development helpers
if (APP_ENV === 'development') {
    // Enable all error types for debugging
    error_reporting(E_ALL);
    
    // Function to check XAMPP requirements
    function check_xampp_requirements() {
        $requirements = [
            'PHP Version' => version_compare(PHP_VERSION, '7.4.0', '>='),
            'PDO Extension' => extension_loaded('pdo'),
            'PDO MySQL' => extension_loaded('pdo_mysql'),
            'GD Extension' => extension_loaded('gd'),
            'FileInfo Extension' => extension_loaded('fileinfo'),
            'JSON Extension' => extension_loaded('json'),
            'Session Support' => function_exists('session_start'),
            'URL Rewrite' => function_exists('apache_get_modules') ? in_array('mod_rewrite', apache_get_modules()) : true
        ];
        
        return $requirements;
    }
    
    // Store requirements check in session for debug page
    if (!isset($_SESSION['xampp_requirements'])) {
        $_SESSION['xampp_requirements'] = check_xampp_requirements();
    }
}