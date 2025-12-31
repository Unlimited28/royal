<?php
/**
 * Production Configuration for Royal Ambassadors OGBC Portal
 * FastPanel Deployment - Phase 3.3: Production Error Handling
 */

return [
    // Error Reporting - Disable in production
    'error_reporting' => false,
    'display_errors' => false,
    'display_startup_errors' => false,
    'log_errors' => true,
    
    // Error Logging Configuration
    'error_log' => __DIR__ . '/../storage/logs/error.log',
    'log_level' => 'ERROR', // Only log errors and critical issues
    
    // Custom Error Pages
    'custom_error_pages' => [
        '404' => '/error_pages/404.html',
        '500' => '/error_pages/500.html',
        '403' => '/error_pages/403.html',
    ],
    
    // Security Headers for Production
    'security_headers' => [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'X-XSS-Protection' => '1; mode=block',
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
    ],
    
    // Session Security for FastPanel
    'session' => [
        'cookie_secure' => true, // HTTPS only
        'cookie_httponly' => true,
        'cookie_samesite' => 'Strict',
        'use_strict_mode' => true,
        'save_path' => __DIR__ . '/../storage/sessions',
    ],
    
    // File Upload Security
    'upload_security' => [
        'max_file_size' => '10M',
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        'scan_uploads' => true,
        'quarantine_path' => __DIR__ . '/../storage/quarantine',
    ],
    
    // Database Security
    'database_security' => [
        'use_prepared_statements' => true,
        'log_queries' => false, // Disable query logging in production
        'connection_timeout' => 30,
    ],
    
    // Performance Settings
    'performance' => [
        'enable_caching' => true,
        'cache_lifetime' => 3600, // 1 hour
        'compress_output' => true,
        'minify_html' => true,
    ],
    
    // Monitoring
    'monitoring' => [
        'health_check_endpoint' => '/health',
        'status_endpoint' => '/status',
        'log_slow_queries' => true,
        'slow_query_threshold' => 2.0, // seconds
    ]
];