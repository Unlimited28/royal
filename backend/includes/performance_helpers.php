<?php
/**
 * Performance Helper Functions
 * Provides utilities for optimizing database queries and caching
 */

require_once 'cache.php';
require_once 'database_optimizer.php';

/**
 * Enhanced pagination with caching
 */
function get_paginated_data($table, $conditions = [], $page = 1, $per_page = 20, $order_by = 'id DESC', $cache_ttl = 300) {
    $cache_key = 'paginated_' . $table . '_' . md5(serialize($conditions) . $page . $per_page . $order_by);
    
    return cache_remember($cache_key, function() use ($table, $conditions, $page, $per_page, $order_by) {
        global $pdo;
        
        // Build WHERE clause
        $where_conditions = [];
        $params = [];
        
        foreach ($conditions as $field => $value) {
            if (is_array($value)) {
                $placeholders = str_repeat('?,', count($value) - 1) . '?';
                $where_conditions[] = "$field IN ($placeholders)";
                $params = array_merge($params, $value);
            } else {
                $where_conditions[] = "$field = ?";
                $params[] = $value;
            }
        }
        
        $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
        
        // Count total records
        $count_sql = "SELECT COUNT(*) as total FROM $table $where_clause";
        $count_stmt = $pdo->prepare($count_sql);
        $count_stmt->execute($params);
        $total_records = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get paginated data
        $offset = ($page - 1) * $per_page;
        $data_sql = "SELECT * FROM $table $where_clause ORDER BY $order_by LIMIT ? OFFSET ?";
        $params[] = $per_page;
        $params[] = $offset;
        
        $data_stmt = $pdo->prepare($data_sql);
        $data_stmt->execute($params);
        $data = $data_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'data' => $data,
            'total' => $total_records,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total_records / $per_page)
        ];
    }, $cache_ttl);
}

/**
 * Optimized user search with caching
 */
function search_users_optimized($query, $filters = [], $limit = 20) {
    $cache_key = 'search_users_' . md5($query . serialize($filters) . $limit);
    
    return cache_remember($cache_key, function() use ($query, $filters, $limit) {
        global $pdo;
        
        $where_conditions = ['(u.full_name LIKE ? OR u.email LIKE ? OR u.unique_id LIKE ?)'];
        $params = ["%$query%", "%$query%", "%$query%"];
        
        // Add filters
        if (!empty($filters['role'])) {
            $where_conditions[] = 'u.role = ?';
            $params[] = $filters['role'];
        }
        
        if (!empty($filters['association_id'])) {
            $where_conditions[] = 'u.association_id = ?';
            $params[] = $filters['association_id'];
        }
        
        if (!empty($filters['status'])) {
            $where_conditions[] = 'u.status = ?';
            $params[] = $filters['status'];
        }
        
        $where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
        
        $sql = "
            SELECT 
                u.id, u.unique_id, u.full_name, u.email, u.role, u.status,
                a.name as association_name,
                r.name as rank_name
            FROM users u
            LEFT JOIN associations a ON u.association_id = a.id
            LEFT JOIN ranks r ON u.rank_id = r.id
            $where_clause
            ORDER BY u.full_name
            LIMIT ?
        ";
        
        $params[] = $limit;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }, 300);
}

/**
 * Get dashboard statistics with caching
 */
function get_dashboard_stats_cached($user_id, $role) {
    $optimizer = get_db_optimizer();
    return $optimizer->getDashboardStats($user_id, $role);
}

/**
 * Optimized notification retrieval
 */
function get_notifications_optimized($user_id, $role, $limit = 10, $unread_only = false) {
    $cache_key = "notifications_{$user_id}_{$role}_{$limit}_" . ($unread_only ? 'unread' : 'all');
    
    return cache_remember($cache_key, function() use ($user_id, $role, $limit, $unread_only) {
        global $pdo;
        
        $conditions = ['(n.recipient_type = \'all\' OR n.recipient_type = ? OR n.recipient_id = ?)'];
        $params = [$role, $user_id];
        
        if ($unread_only) {
            $conditions[] = 'n.is_read = 0';
        }
        
        $where_clause = 'WHERE ' . implode(' AND ', $conditions);
        
        $sql = "
            SELECT n.*, s.full_name as sender_name
            FROM notifications n
            LEFT JOIN users s ON n.sender_id = s.id
            $where_clause
            ORDER BY n.created_at DESC
            LIMIT ?
        ";
        
        $params[] = $limit;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }, 60);
}

/**
 * Cache invalidation helper
 */
function invalidate_cache_patterns($patterns) {
    $cache = Cache::getInstance();
    
    // For now, we'll clear all cache when patterns match
    // In production, you might want more sophisticated cache tagging
    foreach ($patterns as $pattern) {
        // This is a simplified approach
        $cache->clear();
        break; // Only need to clear once
    }
}

/**
 * Database query performance monitoring
 */
function log_slow_query($sql, $execution_time, $params = []) {
    if ($execution_time > 1.0) { // Log queries taking more than 1 second
        $log_entry = sprintf(
            "[%s] SLOW QUERY (%.2fs): %s | Params: %s\n",
            date('Y-m-d H:i:s'),
            $execution_time,
            $sql,
            json_encode($params)
        );
        
        error_log($log_entry, 3, dirname(__DIR__) . '/logs/slow_queries.log');
    }
}

/**
 * Enhanced PDO wrapper with performance monitoring
 */
function execute_query_with_monitoring($sql, $params = []) {
    global $pdo;
    
    $start_time = microtime(true);
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $execution_time = microtime(true) - $start_time;
        log_slow_query($sql, $execution_time, $params);
        
        return $stmt;
    } catch (PDOException $e) {
        $execution_time = microtime(true) - $start_time;
        
        $error_log = sprintf(
            "[%s] QUERY ERROR (%.2fs): %s | Params: %s | Error: %s\n",
            date('Y-m-d H:i:s'),
            $execution_time,
            $sql,
            json_encode($params),
            $e->getMessage()
        );
        
        error_log($error_log, 3, dirname(__DIR__) . '/logs/query_errors.log');
        throw $e;
    }
}

/**
 * Memory usage monitoring
 */
function log_memory_usage($checkpoint = '') {
    $memory_usage = memory_get_usage(true);
    $peak_memory = memory_get_peak_usage(true);
    
    $log_entry = sprintf(
        "[%s] MEMORY %s: Current: %s, Peak: %s\n",
        date('Y-m-d H:i:s'),
        $checkpoint,
        format_bytes($memory_usage),
        format_bytes($peak_memory)
    );
    
    error_log($log_entry, 3, dirname(__DIR__) . '/logs/memory.log');
}

/**
 * Format bytes for human reading
 */
function format_bytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Asset versioning for cache busting
 */
function asset_version($file_path) {
    $full_path = dirname(__DIR__) . '/public/' . ltrim($file_path, '/');
    
    if (file_exists($full_path)) {
        return $file_path . '?v=' . filemtime($full_path);
    }
    
    return $file_path;
}

/**
 * Critical CSS inlining
 */
function inline_critical_css() {
    $critical_css_file = dirname(__DIR__) . '/assets/css/critical.css';
    
    if (file_exists($critical_css_file)) {
        echo '<style>' . file_get_contents($critical_css_file) . '</style>';
    }
}