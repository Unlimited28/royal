<?php
/**
 * Cache Cleanup Cron Job
 * Cleans expired cache entries and optimizes cache storage
 */

require_once dirname(__DIR__) . '/includes/cache.php';

// Set up error logging
ini_set('log_errors', 1);
ini_set('error_log', dirname(__DIR__) . '/logs/cache_cleanup.log');

try {
    $cache = Cache::getInstance();
    
    // Clean expired cache entries
    $cleaned = $cache->cleanExpired();
    
    // Get cache statistics
    $stats = $cache->getStats();
    
    // Log cleanup results
    $message = sprintf(
        "[%s] Cache cleanup completed. Cleaned: %d entries. Total: %d entries, Size: %s",
        date('Y-m-d H:i:s'),
        $cleaned,
        $stats['total_entries'],
        $stats['total_size_formatted']
    );
    
    error_log($message);
    
    // If running from command line, output results
    if (php_sapi_name() === 'cli') {
        echo $message . PHP_EOL;
    }
    
    // Clean up old log files (keep last 30 days)
    $log_dir = dirname(__DIR__) . '/logs/';
    if (is_dir($log_dir)) {
        $files = glob($log_dir . '*.log');
        foreach ($files as $file) {
            if (filemtime($file) < strtotime('-30 days')) {
                unlink($file);
            }
        }
    }
    
} catch (Exception $e) {
    $error_message = sprintf(
        "[%s] Cache cleanup failed: %s",
        date('Y-m-d H:i:s'),
        $e->getMessage()
    );
    
    error_log($error_message);
    
    if (php_sapi_name() === 'cli') {
        echo $error_message . PHP_EOL;
    }
}