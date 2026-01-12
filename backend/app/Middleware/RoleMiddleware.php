<?php

namespace App\Middleware;

/**
 * Role-based Access Control Middleware
 */
class RoleMiddleware {
    private $requiredRole;
    
    public function __construct($requiredRole = null) {
        // Extract role from middleware string like "role:admin"
        if ($requiredRole && strpos($requiredRole, ':') !== false) {
            $this->requiredRole = explode(':', $requiredRole)[1];
        } else {
            $this->requiredRole = $requiredRole;
        }
    }
    
    public function handle() {
        // First check if user is authenticated
        $authMiddleware = new AuthMiddleware();
        if (!$authMiddleware->handle()) {
            return false;
        }
        
        if (!$this->requiredRole) {
            return true; // No specific role required
        }
        
        $userRole = $_SESSION['user_role'] ?? null;
        
        if (!$this->hasPermission($userRole, $this->requiredRole)) {
            log_security_event('unauthorized_access', 
                "User with role '{$userRole}' attempted to access '{$this->requiredRole}' resource", 
                $_SESSION['user_id']
            );
            
            if ($this->isAjaxRequest()) {
                http_response_code(403);
                echo json_encode(['error' => 'Insufficient permissions']);
                exit;
            }
            
            header('Location: /dashboard?error=insufficient_permissions');
            exit;
        }
        
        return true;
    }
    
    private function hasPermission($userRole, $requiredRole) {
        $hierarchy = [
            'ambassador' => 1,
            'president' => 2,
            'admin' => 3,
            'superadmin' => 4
        ];
        
        $userLevel = $hierarchy[$userRole] ?? 0;
        $requiredLevel = $hierarchy[$requiredRole] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }
    
    private function isAjaxRequest() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
}