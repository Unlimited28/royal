<?php
/**
 * Bootstrap file for Royal Ambassadors OGBC Portal
 * FastPanel Deployment - Production Ready
 */

// PHP Version Validation (Phase 1.4)
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    die('This application requires PHP 7.4.0 or higher. Current version: ' . PHP_VERSION);
}

// Set timezone
date_default_timezone_set('UTC');

// Load environment configuration
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $env = parse_ini_file($envFile);
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

// Determine environment
$environment = $_ENV['APP_ENV'] ?? 'production';

// Load configuration based on environment
if ($environment === 'production') {
    $config = require __DIR__ . '/../config/production.php';
    
    // Initialize production error handler
    require_once __DIR__ . '/Core/ErrorHandler.php';
    new \App\Core\ErrorHandler($config);
    
    // Set security headers
    foreach ($config['security_headers'] as $header => $value) {
        header("$header: $value");
    }
    
    // Configure session for production
    ini_set('session.cookie_secure', $config['session']['cookie_secure']);
    ini_set('session.cookie_httponly', $config['session']['cookie_httponly']);
    ini_set('session.cookie_samesite', $config['session']['cookie_samesite']);
    ini_set('session.use_strict_mode', $config['session']['use_strict_mode']);
    ini_set('session.save_path', $config['session']['save_path']);
    
    // Ensure session directory exists
    if (!is_dir($config['session']['save_path'])) {
        mkdir($config['session']['save_path'], 0755, true);
    }
} else {
    // Development configuration
    $config = require __DIR__ . '/../config/app.php';
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Auto-load classes
spl_autoload_register(function ($class) {
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = __DIR__ . '/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Set global configuration
$GLOBALS['config'] = $config;

// Health check endpoint for monitoring
if ($_SERVER['REQUEST_URI'] === '/health' && $environment === 'production') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('c'),
        'php_version' => PHP_VERSION,
        'memory_usage' => memory_get_usage(true),
        'disk_free' => disk_free_space(__DIR__)
    ]);
    exit;
}

// Status endpoint for monitoring
if ($_SERVER['REQUEST_URI'] === '/status' && $environment === 'production') {
    header('Content-Type: application/json');
    echo json_encode([
        'application' => 'Royal Ambassadors OGBC Portal',
        'version' => '1.0.0',
        'environment' => $environment,
        'timestamp' => date('c')
    ]);
    exit;
}