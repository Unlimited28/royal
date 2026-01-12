<?php

namespace App\Middleware;

/**
 * Authentication Middleware
 */
class AuthMiddleware {
    public function handle() {
        if (!isset($_SESSION['user_id'])) {
            // Store intended URL for redirect after login
            $_SESSION['intended_url'] = $_SERVER['REQUEST_URI'];
            
            if ($this->isAjaxRequest()) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }
            
            header('Location: /login');
            exit;
        }
        
        // Check session timeout
        if (isset($_SESSION['last_activity']) && 
            (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
            
            session_unset();
            session_destroy();
            header('Location: /login?timeout=1');
            exit;
        }
        
        $_SESSION['last_activity'] = time();
        return true;
    }
    
    private function isAjaxRequest() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
}