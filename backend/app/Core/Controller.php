<?php

namespace App\Core;

/**
 * Base controller with common functions (render views, redirect, etc.)
 */
class Controller {
    protected $view;
    protected $request;
    
    public function __construct() {
        $this->view = new View();
        $this->request = $_REQUEST;
    }
    
    /**
     * Render a view with data
     */
    protected function render($viewName, $data = []) {
        return $this->view->render($viewName, $data);
    }
    
    /**
     * Render JSON response
     */
    protected function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Redirect to URL
     */
    protected function redirect($url, $statusCode = 302) {
        if (!headers_sent()) {
            header("Location: {$url}", true, $statusCode);
            exit;
        }
    }
    
    /**
     * Redirect back with message
     */
    protected function back($message = null, $type = 'info') {
        if ($message) {
            $this->setFlash($message, $type);
        }
        
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        $this->redirect($referer);
    }
    
    /**
     * Set flash message
     */
    protected function setFlash($message, $type = 'info') {
        $_SESSION['flash'] = [
            'message' => $message,
            'type' => $type
        ];
    }
    
    /**
     * Get flash message
     */
    protected function getFlash() {
        if (isset($_SESSION['flash'])) {
            $flash = $_SESSION['flash'];
            unset($_SESSION['flash']);
            return $flash;
        }
        return null;
    }
    
    /**
     * Validate CSRF token
     */
    protected function validateCSRF() {
        if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $_POST['csrf_token']);
    }
    
    /**
     * Generate CSRF token HTML input
     */
    protected function csrfField() {
        $token = $_SESSION['csrf_token'] ?? '';
        return "<input type='hidden' name='csrf_token' value='{$token}'>";
    }
    
    /**
     * Check if user is authenticated
     */
    protected function isAuthenticated() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Get current user
     */
    protected function getCurrentUser() {
        if (!$this->isAuthenticated()) {
            return null;
        }
        
        return DB::fetchOne(
            "SELECT * FROM users WHERE id = ? AND status = 'active'",
            [$_SESSION['user_id']]
        );
    }
    
    /**
     * Check if user has role
     */
    protected function hasRole($role) {
        $user = $this->getCurrentUser();
        if (!$user) {
            return false;
        }
        
        return $user['role'] === $role || $this->hasHigherRole($user['role'], $role);
    }
    
    /**
     * Check if user has higher role
     */
    private function hasHigherRole($userRole, $requiredRole) {
        $hierarchy = ['ambassador', 'president', 'admin', 'superadmin'];
        $userLevel = array_search($userRole, $hierarchy);
        $requiredLevel = array_search($requiredRole, $hierarchy);
        
        return $userLevel !== false && $requiredLevel !== false && $userLevel >= $requiredLevel;
    }
    
    /**
     * Require authentication
     */
    protected function requireAuth() {
        if (!$this->isAuthenticated()) {
            $this->redirect('/login');
        }
    }
    
    /**
     * Require specific role
     */
    protected function requireRole($role) {
        $this->requireAuth();
        
        if (!$this->hasRole($role)) {
            $this->json(['error' => 'Insufficient permissions'], 403);
        }
    }
    
    /**
     * Validate input data
     */
    protected function validate($data, $rules) {
        $validator = new Validator();
        return $validator->validate($data, $rules);
    }
    
    /**
     * Sanitize input
     */
    protected function sanitize($input) {
        if (is_array($input)) {
            return array_map([$this, 'sanitize'], $input);
        }
        
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Get paginated results
     */
    protected function paginate($query, $params = [], $page = 1, $perPage = 20) {
        $page = max(1, (int)$page);
        $perPage = min($perPage, MAX_PAGE_SIZE);
        $offset = ($page - 1) * $perPage;
        
        // Get total count
        $countQuery = preg_replace('/SELECT .+ FROM/i', 'SELECT COUNT(*) as total FROM', $query);
        $total = DB::fetchOne($countQuery, $params)['total'];
        
        // Get paginated results
        $paginatedQuery = $query . " LIMIT {$perPage} OFFSET {$offset}";
        $results = DB::fetchAll($paginatedQuery, $params);
        
        return [
            'data' => $results,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage),
                'has_prev' => $page > 1,
                'has_next' => $page < ceil($total / $perPage)
            ]
        ];
    }
    
    /**
     * Log activity
     */
    protected function logActivity($type, $description, $data = null) {
        $userId = $_SESSION['user_id'] ?? null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        DB::query(
            "INSERT INTO activity_logs (user_id, type, description, data, ip_address, user_agent, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [$userId, $type, $description, json_encode($data), $ipAddress, $userAgent]
        );
    }
    
    /**
     * Handle file upload
     */
    protected function handleUpload($field, $allowedTypes = [], $maxSize = null) {
        if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'error' => 'No file uploaded or upload error'];
        }
        
        $file = $_FILES[$field];
        $maxSize = $maxSize ?: MAX_FILE_SIZE;
        
        // Check file size
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'error' => 'File size exceeds limit'];
        }
        
        // Check file type
        $fileInfo = pathinfo($file['name']);
        $extension = strtolower($fileInfo['extension']);
        
        if (!empty($allowedTypes) && !in_array($extension, $allowedTypes)) {
            return ['success' => false, 'error' => 'File type not allowed'];
        }
        
        // Generate unique filename
        $fileName = uniqid() . '_' . time() . '.' . $extension;
        
        return [
            'success' => true,
            'file' => $file,
            'filename' => $fileName,
            'extension' => $extension,
            'size' => $file['size']
        ];
    }
}