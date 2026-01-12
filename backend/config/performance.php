<?php
/**
 * Performance Optimization Configuration
 * Database indexes, caching, and query optimization
 */

// Prevent direct access
if (!defined('PHP_VERSION')) {
    http_response_code(403);
    exit('Direct access forbidden');
}

class PerformanceOptimizer {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Create database indexes for frequently queried fields
     */
    public function createIndexes() {
        $indexes = [
            // User-related indexes
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
            'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
            
            // Association-related indexes
            'CREATE INDEX IF NOT EXISTS idx_associations_president_id ON associations(president_id)',
            'CREATE INDEX IF NOT EXISTS idx_associations_status ON associations(status)',
            'CREATE INDEX IF NOT EXISTS idx_association_members_user_id ON association_members(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_association_members_association_id ON association_members(association_id)',
            
            // Exam-related indexes
            'CREATE INDEX IF NOT EXISTS idx_exams_association_id ON exams(association_id)',
            'CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by)',
            'CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status)',
            'CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id)',
            'CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id)',
            'CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(score)',
            
            // Session and security indexes
            'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)',
            'CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address)',
            'CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at)',
            
            // Content indexes
            'CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id)',
            'CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)',
            'CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_gallery_association_id ON gallery(association_id)',
            'CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at)',
            
            // Notification indexes
            'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(is_read)',
            'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)',
        ];
        
        $created = 0;
        foreach ($indexes as $sql) {
            try {
                $this->pdo->exec($sql);
                $created++;
            } catch (PDOException $e) {
                error_log("Failed to create index: " . $e->getMessage());
            }
        }
        
        return $created;
    }
    
    /**
     * Analyze query performance and suggest optimizations
     */
    public function analyzeQueries($queries = []) {
        $results = [];
        
        foreach ($queries as $query) {
            try {
                // Use EXPLAIN to analyze query
                $stmt = $this->pdo->prepare("EXPLAIN " . $query);
                $stmt->execute();
                $explain = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $results[] = [
                    'query' => $query,
                    'explain' => $explain,
                    'suggestions' => $this->getSuggestions($explain)
                ];
            } catch (PDOException $e) {
                $results[] = [
                    'query' => $query,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }
    
    private function getSuggestions($explain) {
        $suggestions = [];
        
        foreach ($explain as $row) {
            // Check for full table scans
            if ($row['type'] === 'ALL' && $row['rows'] > 1000) {
                $suggestions[] = "Consider adding an index to table '{$row['table']}' for better performance";
            }
            
            // Check for filesort
            if (isset($row['Extra']) && strpos($row['Extra'], 'Using filesort') !== false) {
                $suggestions[] = "Query uses filesort on table '{$row['table']}' - consider adding appropriate index";
            }
            
            // Check for temporary tables
            if (isset($row['Extra']) && strpos($row['Extra'], 'Using temporary') !== false) {
                $suggestions[] = "Query creates temporary table - consider query optimization";
            }
        }
        
        return $suggestions;
    }
    
    /**
     * Get slow query log analysis
     */
    public function getSlowQueries() {
        try {
            // Check if slow query log is enabled
            $stmt = $this->pdo->query("SHOW VARIABLES LIKE 'slow_query_log'");
            $slowLogEnabled = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($slowLogEnabled['Value'] !== 'ON') {
                return ['error' => 'Slow query log is not enabled'];
            }
            
            // Get slow query log file location
            $stmt = $this->pdo->query("SHOW VARIABLES LIKE 'slow_query_log_file'");
            $logFile = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'enabled' => true,
                'log_file' => $logFile['Value']
            ];
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Enable query profiling
     */
    public function enableProfiling() {
        try {
            $this->pdo->exec("SET profiling = 1");
            return true;
        } catch (PDOException $e) {
            error_log("Failed to enable profiling: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get query profiles
     */
    public function getProfiles() {
        try {
            $stmt = $this->pdo->query("SHOW PROFILES");
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Get detailed profile for a specific query
     */
    public function getProfileDetail($queryId) {
        try {
            $stmt = $this->pdo->prepare("SHOW PROFILE FOR QUERY ?");
            $stmt->execute([$queryId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => $e->getMessage()];
        }
    }
}

/**
 * Cache Management Class
 */
class CacheManager {
    private $cacheDir;
    private $defaultTtl = 3600; // 1 hour
    
    public function __construct($cacheDir = null) {
        $this->cacheDir = $cacheDir ?: dirname(__DIR__) . '/cache';
        
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0750, true);
        }
    }
    
    /**
     * Get cached data
     */
    public function get($key) {
        $filename = $this->getCacheFilename($key);
        
        if (!file_exists($filename)) {
            return null;
        }
        
        $data = file_get_contents($filename);
        $cache = json_decode($data, true);
        
        if (!$cache || $cache['expires'] < time()) {
            unlink($filename);
            return null;
        }
        
        return $cache['data'];
    }
    
    /**
     * Set cached data
     */
    public function set($key, $data, $ttl = null) {
        $ttl = $ttl ?: $this->defaultTtl;
        $filename = $this->getCacheFilename($key);
        
        $cache = [
            'data' => $data,
            'expires' => time() + $ttl,
            'created' => time()
        ];
        
        return file_put_contents($filename, json_encode($cache)) !== false;
    }
    
    /**
     * Delete cached data
     */
    public function delete($key) {
        $filename = $this->getCacheFilename($key);
        
        if (file_exists($filename)) {
            return unlink($filename);
        }
        
        return true;
    }
    
    /**
     * Clear all cache
     */
    public function clear() {
        $files = glob($this->cacheDir . '/*.cache');
        $deleted = 0;
        
        foreach ($files as $file) {
            if (unlink($file)) {
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    /**
     * Clean expired cache files
     */
    public function cleanExpired() {
        $files = glob($this->cacheDir . '/*.cache');
        $deleted = 0;
        
        foreach ($files as $file) {
            $data = file_get_contents($file);
            $cache = json_decode($data, true);
            
            if (!$cache || $cache['expires'] < time()) {
                if (unlink($file)) {
                    $deleted++;
                }
            }
        }
        
        return $deleted;
    }
    
    private function getCacheFilename($key) {
        return $this->cacheDir . '/' . md5($key) . '.cache';
    }
}