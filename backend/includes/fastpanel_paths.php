<?php
/**
 * Royal Ambassadors OGBC Portal - FastPanel Path Updates
 * Updates all file paths for FastPanel compatibility
 */

// Include FastPanel configuration
require_once dirname(__DIR__) . '/config/fastpanel.php';

/**
 * Update include paths for FastPanel
 */
function update_include_paths() {
    $include_paths = [
        get_fastpanel_path('includes/config/database.php'),
        get_fastpanel_path('includes/functions.php'),
        get_fastpanel_path('includes/auth.php'),
        get_fastpanel_path('app/bootstrap.php'),
    ];
    
    foreach ($include_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
        }
    }
}

/**
 * Get corrected asset URLs for FastPanel
 */
function asset_url($path) {
    return get_fastpanel_url('assets/' . ltrim($path, '/'));
}

/**
 * Get corrected upload URLs for FastPanel
 */
function upload_url($path) {
    return get_fastpanel_url('public/uploads/' . ltrim($path, '/'));
}

/**
 * Get corrected file paths for includes
 */
function include_path($path) {
    return get_fastpanel_path('includes/' . ltrim($path, '/'));
}

/**
 * Get corrected paths for configuration files
 */
function config_path($path) {
    return get_fastpanel_path('config/' . ltrim($path, '/'));
}

/**
 * Update database configuration for FastPanel
 */
function get_fastpanel_db_config() {
    return [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'database' => getenv('DB_NAME') ?: 'ra_ogbc_portal',
        'username' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    ];
}

/**
 * Handle file uploads with FastPanel compatibility
 */
function handle_fastpanel_upload($file, $destination_folder = 'general') {
    if (!isset($file['error']) || is_array($file['error'])) {
        throw new RuntimeException('Invalid parameters.');
    }
    
    // Check upload errors
    switch ($file['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            throw new RuntimeException('No file sent.');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new RuntimeException('Exceeded filesize limit.');
        default:
            throw new RuntimeException('Unknown upload error.');
    }
    
    // Validate file size (10MB max)
    if ($file['size'] > 10 * 1024 * 1024) {
        throw new RuntimeException('Exceeded filesize limit.');
    }
    
    // Validate file type
    $allowed_types = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($file['tmp_name']);
    
    if (!in_array($mime_type, $allowed_types)) {
        throw new RuntimeException('Invalid file format.');
    }
    
    // Generate secure filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    
    // Get upload directory
    $upload_dir = get_upload_directory($destination_folder);
    $destination = $upload_dir . '/' . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Failed to move uploaded file.');
    }
    
    // Set proper permissions for FastPanel
    chmod($destination, 0644);
    if (IS_FASTPANEL) {
        chown($destination, 'www-data');
        chgrp($destination, 'www-data');
    }
    
    return [
        'filename' => $filename,
        'path' => $destination,
        'url' => upload_url($destination_folder . '/' . $filename),
        'size' => $file['size'],
        'type' => $mime_type
    ];
}

/**
 * Get navigation URLs updated for FastPanel
 */
function get_navigation_urls() {
    $base_url = getenv('BASE_URL') ?: 'http://localhost';
    
    return [
        'home' => $base_url . '/',
        'login' => $base_url . '/public/login.php',
        'register' => $base_url . '/public/register.php',
        'blog' => $base_url . '/public/blog.php',
        'gallery' => $base_url . '/public/gallery.php',
        'dashboard' => $base_url . '/ambassador/dashboard.php',
        'admin' => $base_url . '/ADMIN/dashboard.php',
        'president' => $base_url . '/association-president/dashboard.php',
    ];
}

/**
 * Update redirect functions for FastPanel
 */
function fastpanel_redirect($url, $permanent = false) {
    if (!headers_sent()) {
        $status_code = $permanent ? 301 : 302;
        
        // Handle relative URLs
        if (!parse_url($url, PHP_URL_SCHEME)) {
            $base_url = getenv('BASE_URL') ?: 'http://localhost';
            $url = $base_url . '/' . ltrim($url, '/');
        }
        
        header("Location: $url", true, $status_code);
        exit();
    }
}

/**
 * Get error page paths for FastPanel
 */
function get_error_page($error_code) {
    $error_pages = [
        403 => get_fastpanel_path('error_pages/403.html'),
        404 => get_fastpanel_path('error_pages/404.html'),
        500 => get_fastpanel_path('error_pages/500.html'),
    ];
    
    return isset($error_pages[$error_code]) ? $error_pages[$error_code] : null;
}

/**
 * Initialize FastPanel paths and configuration
 */
function init_fastpanel_paths() {
    // Update include paths
    update_include_paths();
    
    // Set up error handling
    if (getenv('APP_ENV') === 'production') {
        set_error_handler(function($severity, $message, $file, $line) {
            $log_message = "Error: $message in $file on line $line";
            log_fastpanel_info($log_message, 'ERROR');
            
            // Show generic error page in production
            if ($severity === E_ERROR || $severity === E_USER_ERROR) {
                $error_page = get_error_page(500);
                if ($error_page && file_exists($error_page)) {
                    include $error_page;
                    exit();
                }
            }
        });
        
        set_exception_handler(function($exception) {
            $log_message = "Uncaught exception: " . $exception->getMessage() . 
                          " in " . $exception->getFile() . 
                          " on line " . $exception->getLine();
            log_fastpanel_info($log_message, 'ERROR');
            
            $error_page = get_error_page(500);
            if ($error_page && file_exists($error_page)) {
                include $error_page;
                exit();
            }
        });
    }
    
    log_fastpanel_info('FastPanel paths initialized successfully');
}

// Auto-initialize if FastPanel mode is detected
if (IS_FASTPANEL) {
    init_fastpanel_paths();
}

?>