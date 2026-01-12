<?php
/**
 * Royal Ambassadors OGBC Portal - FastPanel Configuration
 * Handles FastPanel-specific settings and path configurations
 */

// FastPanel environment detection
define('IS_FASTPANEL', getenv('FASTPANEL_MODE') === 'true' || isset($_SERVER['FASTPANEL_MODE']));

// Base paths for FastPanel compatibility
if (IS_FASTPANEL) {
    // FastPanel uses /var/www/html as document root
    define('FASTPANEL_ROOT', '/var/www/html');
    define('FASTPANEL_PUBLIC', FASTPANEL_ROOT . '/public');
    define('FASTPANEL_STORAGE', FASTPANEL_ROOT . '/storage');
    define('FASTPANEL_UPLOADS', FASTPANEL_PUBLIC . '/uploads');
    
    // Session configuration for FastPanel
    $session_path = getenv('SESSION_SAVE_PATH') ?: '/tmp/sessions';
    if (!is_dir($session_path)) {
        mkdir($session_path, 0755, true);
        chown($session_path, 'www-data');
        chgrp($session_path, 'www-data');
    }
    
    ini_set('session.save_path', $session_path);
    ini_set('session.gc_maxlifetime', 3600); // 1 hour
    ini_set('session.cookie_lifetime', 0); // Until browser closes
    ini_set('session.use_strict_mode', 1);
    
    // Upload configuration for FastPanel
    $upload_tmp_dir = getenv('UPLOAD_TMP_DIR') ?: '/tmp/uploads';
    if (!is_dir($upload_tmp_dir)) {
        mkdir($upload_tmp_dir, 0755, true);
        chown($upload_tmp_dir, 'www-data');
        chgrp($upload_tmp_dir, 'www-data');
    }
    
    ini_set('upload_tmp_dir', $upload_tmp_dir);
    ini_set('upload_max_filesize', '10M');
    ini_set('post_max_size', '12M');
    ini_set('max_file_uploads', 20);
    
    // Memory and execution limits for FastPanel
    ini_set('memory_limit', '256M');
    ini_set('max_execution_time', 300);
    ini_set('max_input_time', 300);
    ini_set('max_input_vars', 3000);
    
    // Error handling for FastPanel
    if (getenv('APP_ENV') === 'production') {
        ini_set('display_errors', 0);
        ini_set('log_errors', 1);
        ini_set('error_log', FASTPANEL_STORAGE . '/logs/error.log');
    }
    
    // OPcache configuration for FastPanel
    if (extension_loaded('opcache')) {
        ini_set('opcache.enable', 1);
        ini_set('opcache.memory_consumption', 128);
        ini_set('opcache.max_accelerated_files', 4000);
        ini_set('opcache.revalidate_freq', 2);
        ini_set('opcache.validate_timestamps', getenv('APP_ENV') === 'production' ? 0 : 1);
    }
}

/**
 * Get the correct file path for FastPanel environment
 */
function get_fastpanel_path($relative_path) {
    if (IS_FASTPANEL) {
        // Remove leading slash if present
        $relative_path = ltrim($relative_path, '/');
        
        // Handle different path types
        if (strpos($relative_path, 'public/') === 0) {
            return FASTPANEL_ROOT . '/' . $relative_path;
        } elseif (strpos($relative_path, 'storage/') === 0) {
            return FASTPANEL_ROOT . '/' . $relative_path;
        } elseif (strpos($relative_path, 'uploads/') === 0) {
            return FASTPANEL_PUBLIC . '/' . $relative_path;
        } else {
            return FASTPANEL_ROOT . '/' . $relative_path;
        }
    }
    
    // Default behavior for non-FastPanel environments
    return dirname(__DIR__) . '/' . ltrim($relative_path, '/');
}

/**
 * Get the correct URL for assets in FastPanel environment
 */
function get_fastpanel_url($relative_path) {
    $base_url = getenv('BASE_URL') ?: 'http://localhost';
    $relative_path = ltrim($relative_path, '/');
    
    if (IS_FASTPANEL) {
        // FastPanel serves from document root
        return $base_url . '/' . $relative_path;
    }
    
    return $base_url . '/' . $relative_path;
}

/**
 * Ensure directory exists with proper permissions for FastPanel
 */
function ensure_fastpanel_directory($path) {
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        
        if (IS_FASTPANEL) {
            // Set proper ownership for FastPanel
            chown($path, 'www-data');
            chgrp($path, 'www-data');
        }
    }
    
    return is_dir($path) && is_writable($path);
}

/**
 * Get upload directory with FastPanel compatibility
 */
function get_upload_directory($subdirectory = '') {
    $upload_base = IS_FASTPANEL ? FASTPANEL_UPLOADS : dirname(__DIR__) . '/public/uploads';
    
    if ($subdirectory) {
        $upload_path = $upload_base . '/' . trim($subdirectory, '/');
        ensure_fastpanel_directory($upload_path);
        return $upload_path;
    }
    
    return $upload_base;
}

/**
 * Get storage directory with FastPanel compatibility
 */
function get_storage_directory($subdirectory = '') {
    $storage_base = IS_FASTPANEL ? FASTPANEL_STORAGE : dirname(__DIR__) . '/storage';
    
    if ($subdirectory) {
        $storage_path = $storage_base . '/' . trim($subdirectory, '/');
        ensure_fastpanel_directory($storage_path);
        return $storage_path;
    }
    
    return $storage_base;
}

/**
 * Configure FastPanel-specific security headers
 */
function set_fastpanel_security_headers() {
    if (!headers_sent()) {
        // Security headers
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Content Security Policy
        $csp = "default-src 'self'; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " .
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " .
               "font-src 'self' https://fonts.gstatic.com; " .
               "img-src 'self' data: https:; " .
               "connect-src 'self';";
        
        header("Content-Security-Policy: $csp");
        
        // HSTS for production with HTTPS
        if (getenv('APP_ENV') === 'production' && 
            (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }
}

/**
 * Initialize FastPanel session with security
 */
function init_fastpanel_session() {
    if (session_status() === PHP_SESSION_NONE) {
        // Configure session security
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 1 : 0);
        ini_set('session.cookie_samesite', 'Strict');
        
        // Set session name
        session_name('OGBC_PORTAL_SESSION');
        
        // Start session
        session_start();
        
        // Regenerate session ID periodically for security
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }
}

/**
 * Log FastPanel-specific information
 */
function log_fastpanel_info($message, $level = 'INFO') {
    $log_file = get_storage_directory('logs') . '/fastpanel.log';
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[$timestamp] [$level] $message" . PHP_EOL;
    
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

// Initialize FastPanel configuration
if (IS_FASTPANEL) {
    // Set security headers
    set_fastpanel_security_headers();
    
    // Initialize session
    init_fastpanel_session();
    
    // Log FastPanel initialization
    log_fastpanel_info('FastPanel configuration initialized successfully');
    
    // Ensure required directories exist
    ensure_fastpanel_directory(get_storage_directory('logs'));
    ensure_fastpanel_directory(get_storage_directory('cache'));
    ensure_fastpanel_directory(get_storage_directory('sessions'));
    ensure_fastpanel_directory(get_upload_directory('receipts'));
    ensure_fastpanel_directory(get_upload_directory('camp_files'));
    ensure_fastpanel_directory(get_upload_directory('profile_pictures'));
}

?>