<?php
/**
 * Performance Check Script
 * Analyzes database performance and provides optimization suggestions
 */

// Prevent web access
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This script can only be run from command line');
}

require_once dirname(__DIR__) . '/config/production.php';
require_once dirname(__DIR__) . '/config/performance.php';

echo "=== Performance Analysis Report ===\n\n";

try {
    // Connect to database
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    
    $optimizer = new PerformanceOptimizer($pdo);
    
    // Check database size
    echo "--- Database Statistics ---\n";
    $stmt = $pdo->query("
        SELECT 
            table_name,
            table_rows,
            ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
        FROM information_schema.tables 
        WHERE table_schema = '" . DB_NAME . "'
        ORDER BY (data_length + index_length) DESC
    ");
    
    $tables = $stmt->fetchAll();
    foreach ($tables as $table) {
        echo sprintf("%-30s %10s rows %8s MB\n", 
            $table['table_name'], 
            number_format($table['table_rows']), 
            $table['size_mb']
        );
    }
    
    // Check for missing indexes
    echo "\n--- Index Analysis ---\n";
    $stmt = $pdo->query("
        SELECT DISTINCT
            table_name,
            column_name
        FROM information_schema.statistics 
        WHERE table_schema = '" . DB_NAME . "'
        ORDER BY table_name, column_name
    ");
    
    $indexes = $stmt->fetchAll();
    echo "Found " . count($indexes) . " indexes in database\n";
    
    // Analyze common queries
    echo "\n--- Query Analysis ---\n";
    $commonQueries = [
        "SELECT * FROM users WHERE email = 'test@example.com'",
        "SELECT * FROM exam_results WHERE user_id = 1",
        "SELECT * FROM associations WHERE status = 'active'",
        "SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 10"
    ];
    
    $optimizer->enableProfiling();
    $results = $optimizer->analyzeQueries($commonQueries);
    
    foreach ($results as $result) {
        if (isset($result['error'])) {
            echo "❌ Query failed: " . $result['error'] . "\n";
            continue;
        }
        
        echo "\nQuery: " . substr($result['query'], 0, 60) . "...\n";
        
        foreach ($result['explain'] as $explain) {
            $type = $explain['type'];
            $rows = $explain['rows'];
            
            if ($type === 'ALL' && $rows > 100) {
                echo "⚠️  Full table scan detected ($rows rows)\n";
            } elseif ($type === 'index') {
                echo "✅ Using index\n";
            }
        }
        
        if (!empty($result['suggestions'])) {
            foreach ($result['suggestions'] as $suggestion) {
                echo "💡 " . $suggestion . "\n";
            }
        }
    }
    
    // Check slow query log
    echo "\n--- Slow Query Log ---\n";
    $slowQueries = $optimizer->getSlowQueries();
    
    if (isset($slowQueries['error'])) {
        echo "⚠️  " . $slowQueries['error'] . "\n";
        echo "To enable slow query log, add to MySQL config:\n";
        echo "slow_query_log = 1\n";
        echo "slow_query_log_file = /var/log/mysql/slow.log\n";
        echo "long_query_time = 2\n";
    } else {
        echo "✅ Slow query log is enabled\n";
        echo "Log file: " . $slowQueries['log_file'] . "\n";
    }
    
    // Memory usage analysis
    echo "\n--- Memory Usage ---\n";
    $stmt = $pdo->query("SHOW STATUS LIKE 'Key_%'");
    $keyStats = $stmt->fetchAll();
    
    foreach ($keyStats as $stat) {
        if ($stat['Variable_name'] === 'Key_read_requests' || 
            $stat['Variable_name'] === 'Key_reads') {
            echo $stat['Variable_name'] . ": " . number_format($stat['Value']) . "\n";
        }
    }
    
    // Connection analysis
    echo "\n--- Connection Statistics ---\n";
    $stmt = $pdo->query("SHOW STATUS LIKE 'Connections'");
    $connections = $stmt->fetch();
    echo "Total connections: " . number_format($connections['Value']) . "\n";
    
    $stmt = $pdo->query("SHOW STATUS LIKE 'Max_used_connections'");
    $maxConnections = $stmt->fetch();
    echo "Max used connections: " . $maxConnections['Value'] . "\n";
    
    // Recommendations
    echo "\n--- Performance Recommendations ---\n";
    
    // Check for large tables without indexes
    foreach ($tables as $table) {
        if ($table['table_rows'] > 1000) {
            echo "💡 Consider partitioning large table: " . $table['table_name'] . "\n";
        }
    }
    
    // Check PHP configuration
    echo "\n--- PHP Configuration Check ---\n";
    $phpSettings = [
        'memory_limit' => '256M',
        'max_execution_time' => '30',
        'opcache.enable' => '1'
    ];
    
    foreach ($phpSettings as $setting => $recommended) {
        $current = ini_get($setting);
        if ($current === $recommended) {
            echo "✅ $setting: $current\n";
        } else {
            echo "⚠️  $setting: $current (recommended: $recommended)\n";
        }
    }
    
    echo "\n✅ Performance analysis completed\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}