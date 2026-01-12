<?php
/**
 * Database Query Optimizer
 * Provides optimized database queries with caching
 */

require_once 'cache.php';

class DatabaseOptimizer {
    private $pdo;
    private $cache;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->cache = Cache::getInstance();
    }
    
    /**
     * Optimized dashboard queries with pagination and caching
     */
    public function getDashboardStats($user_id, $role) {
        $cache_key = "dashboard_stats_{$user_id}_{$role}";
        
        return $this->cache->remember($cache_key, function() use ($user_id, $role) {
            $stats = [];
            
            switch ($role) {
                case 'super_admin':
                    $stats = $this->getSuperAdminStats();
                    break;
                case 'president':
                    $stats = $this->getPresidentStats($user_id);
                    break;
                case 'ambassador':
                    $stats = $this->getAmbassadorStats($user_id);
                    break;
            }
            
            return $stats;
        }, 300); // 5 minutes cache
    }
    
    private function getSuperAdminStats() {
        $sql = "
            SELECT 
                (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'ambassador' AND status = 'active') as total_ambassadors,
                (SELECT COUNT(*) FROM users WHERE role = 'president' AND status = 'active') as total_presidents,
                (SELECT COUNT(*) FROM exams WHERE status = 'published') as total_exams,
                (SELECT COUNT(*) FROM exam_results WHERE status = 'passed') as total_passed_exams,
                (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') as total_revenue,
                (SELECT COUNT(*) FROM notifications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_notifications
        ";
        
        $stmt = $this->pdo->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function getPresidentStats($user_id) {
        $sql = "
            SELECT 
                u.association_id,
                a.name as association_name,
                (SELECT COUNT(*) FROM users WHERE association_id = u.association_id AND status = 'active') as association_members,
                (SELECT COUNT(*) FROM exam_results er 
                 JOIN users u2 ON er.user_id = u2.id 
                 WHERE u2.association_id = u.association_id AND er.status = 'passed') as passed_exams,
                (SELECT COUNT(*) FROM payments p 
                 JOIN users u3 ON p.user_id = u3.id 
                 WHERE u3.association_id = u.association_id AND p.status = 'pending') as pending_payments,
                (SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
                 JOIN users u4 ON p.user_id = u4.id 
                 WHERE u4.association_id = u.association_id AND p.status = 'approved') as association_revenue
            FROM users u
            LEFT JOIN associations a ON u.association_id = a.id
            WHERE u.id = ?
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function getAmbassadorStats($user_id) {
        $sql = "
            SELECT 
                u.full_name,
                u.unique_id,
                r.name as rank_name,
                a.name as association_name,
                (SELECT COUNT(*) FROM exam_results WHERE user_id = ? AND status = 'passed') as passed_exams,
                (SELECT COUNT(*) FROM exam_results WHERE user_id = ? AND status = 'failed') as failed_exams,
                (SELECT COUNT(*) FROM payments WHERE user_id = ? AND status = 'approved') as approved_payments,
                (SELECT COUNT(*) FROM payments WHERE user_id = ? AND status = 'pending') as pending_payments,
                (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE user_id = ? AND status = 'approved') as total_paid
            FROM users u
            LEFT JOIN ranks r ON u.rank_id = r.id
            LEFT JOIN associations a ON u.association_id = a.id
            WHERE u.id = ?
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id, $user_id, $user_id, $user_id, $user_id, $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Paginated exam results with optimized query
     */
    public function getExamResults($filters = [], $page = 1, $per_page = 20) {
        $cache_key = 'exam_results_' . md5(serialize($filters) . $page . $per_page);
        
        return $this->cache->remember($cache_key, function() use ($filters, $page, $per_page) {
            $where_conditions = [];
            $params = [];
            
            // Build WHERE clause
            if (!empty($filters['exam_id'])) {
                $where_conditions[] = 'er.exam_id = ?';
                $params[] = $filters['exam_id'];
            }
            
            if (!empty($filters['user_id'])) {
                $where_conditions[] = 'er.user_id = ?';
                $params[] = $filters['user_id'];
            }
            
            if (!empty($filters['status'])) {
                $where_conditions[] = 'er.status = ?';
                $params[] = $filters['status'];
            }
            
            if (!empty($filters['association_id'])) {
                $where_conditions[] = 'u.association_id = ?';
                $params[] = $filters['association_id'];
            }
            
            $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
            
            // Count total records
            $count_sql = "
                SELECT COUNT(*) as total
                FROM exam_results er
                JOIN users u ON er.user_id = u.id
                JOIN exams e ON er.exam_id = e.id
                $where_clause
            ";
            
            $count_stmt = $this->pdo->prepare($count_sql);
            $count_stmt->execute($params);
            $total_records = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get paginated results
            $offset = ($page - 1) * $per_page;
            $data_sql = "
                SELECT 
                    er.*,
                    u.full_name,
                    u.unique_id,
                    u.email,
                    e.title as exam_title,
                    a.name as association_name
                FROM exam_results er
                JOIN users u ON er.user_id = u.id
                JOIN exams e ON er.exam_id = e.id
                LEFT JOIN associations a ON u.association_id = a.id
                $where_clause
                ORDER BY er.taken_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $per_page;
            $params[] = $offset;
            
            $data_stmt = $this->pdo->prepare($data_sql);
            $data_stmt->execute($params);
            $results = $data_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'data' => $results,
                'total' => $total_records,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil($total_records / $per_page)
            ];
        }, 180); // 3 minutes cache
    }
    
    /**
     * Paginated payments with optimized query
     */
    public function getPayments($filters = [], $page = 1, $per_page = 20) {
        $cache_key = 'payments_' . md5(serialize($filters) . $page . $per_page);
        
        return $this->cache->remember($cache_key, function() use ($filters, $page, $per_page) {
            $where_conditions = [];
            $params = [];
            
            // Build WHERE clause
            if (!empty($filters['user_id'])) {
                $where_conditions[] = 'p.user_id = ?';
                $params[] = $filters['user_id'];
            }
            
            if (!empty($filters['type'])) {
                $where_conditions[] = 'p.type = ?';
                $params[] = $filters['type'];
            }
            
            if (!empty($filters['status'])) {
                $where_conditions[] = 'p.status = ?';
                $params[] = $filters['status'];
            }
            
            if (!empty($filters['association_id'])) {
                $where_conditions[] = 'u.association_id = ?';
                $params[] = $filters['association_id'];
            }
            
            if (!empty($filters['date_from'])) {
                $where_conditions[] = 'p.created_at >= ?';
                $params[] = $filters['date_from'];
            }
            
            if (!empty($filters['date_to'])) {
                $where_conditions[] = 'p.created_at <= ?';
                $params[] = $filters['date_to'];
            }
            
            $where_clause = !empty($where_conditions) ? 'WHERE ' . implode(' AND ', $where_conditions) : '';
            
            // Count total records
            $count_sql = "
                SELECT COUNT(*) as total
                FROM payments p
                JOIN users u ON p.user_id = u.id
                $where_clause
            ";
            
            $count_stmt = $this->pdo->prepare($count_sql);
            $count_stmt->execute($params);
            $total_records = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get paginated results
            $offset = ($page - 1) * $per_page;
            $data_sql = "
                SELECT 
                    p.*,
                    u.full_name,
                    u.unique_id,
                    u.email,
                    a.name as association_name,
                    v.full_name as verified_by_name
                FROM payments p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN associations a ON u.association_id = a.id
                LEFT JOIN users v ON p.verified_by = v.id
                $where_clause
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $per_page;
            $params[] = $offset;
            
            $data_stmt = $this->pdo->prepare($data_sql);
            $data_stmt->execute($params);
            $results = $data_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'data' => $results,
                'total' => $total_records,
                'page' => $page,
                'per_page' => $per_page,
                'total_pages' => ceil($total_records / $per_page)
            ];
        }, 180); // 3 minutes cache
    }
    
    /**
     * Get recent notifications with caching
     */
    public function getRecentNotifications($user_id, $role, $limit = 10) {
        $cache_key = "notifications_{$user_id}_{$role}_{$limit}";
        
        return $this->cache->remember($cache_key, function() use ($user_id, $role, $limit) {
            $sql = "
                SELECT n.*, s.full_name as sender_name
                FROM notifications n
                LEFT JOIN users s ON n.sender_id = s.id
                WHERE (n.recipient_type = 'all' OR n.recipient_type = ? OR n.recipient_id = ?)
                ORDER BY n.created_at DESC
                LIMIT ?
            ";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$role, $user_id, $limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }, 60); // 1 minute cache
    }
    
    /**
     * Clear related caches when data changes
     */
    public function clearRelatedCaches($table, $user_id = null) {
        $patterns = [
            'users' => ['dashboard_stats_', 'notifications_'],
            'exam_results' => ['dashboard_stats_', 'exam_results_'],
            'payments' => ['dashboard_stats_', 'payments_'],
            'notifications' => ['notifications_']
        ];
        
        if (isset($patterns[$table])) {
            foreach ($patterns[$table] as $pattern) {
                // This is a simplified cache clearing - in production you might want more sophisticated cache tagging
                $this->cache->clear();
            }
        }
    }
    
    /**
     * Execute optimized search queries
     */
    public function searchUsers($query, $filters = [], $limit = 20) {
        $cache_key = 'search_users_' . md5($query . serialize($filters) . $limit);
        
        return $this->cache->remember($cache_key, function() use ($query, $filters, $limit) {
            $where_conditions = ['(u.full_name LIKE ? OR u.email LIKE ? OR u.unique_id LIKE ?)'];
            $params = ["%$query%", "%$query%", "%$query%"];
            
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
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }, 300); // 5 minutes cache
    }
}

// Global helper function
function get_db_optimizer() {
    global $pdo;
    static $optimizer = null;
    
    if ($optimizer === null) {
        $optimizer = new DatabaseOptimizer($pdo);
    }
    
    return $optimizer;
}