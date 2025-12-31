<?php
/**
 * Session Guard - Role-based access control
 * Include this file at the top of protected pages
 */

session_start();

/**
 * Check if user is authenticated and has required role
 * @param string|array $required_role Single role or array of allowed roles
 * @param string $redirect_url Where to redirect if access denied
 */
function requireRole($required_role, $redirect_url = '/public/index.php?error=unauthorized') {
    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_role'])) {
        header("Location: $redirect_url");
        exit;
    }
    
    // Check role permission
    $user_role = $_SESSION['user_role'];
    
    if (is_array($required_role)) {
        if (!in_array($user_role, $required_role)) {
            header("Location: $redirect_url");
            exit;
        }
    } else {
        if ($user_role !== $required_role) {
            header("Location: $redirect_url");
            exit;
        }
    }
    
    // Check session timeout (optional - 2 hours)
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > 7200) {
        session_destroy();
        header("Location: /public/index.php?error=session_expired");
        exit;
    }
    
    // Update last activity
    $_SESSION['last_activity'] = time();
}

/**
 * Get current user info
 */
function getCurrentUser() {
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'name' => $_SESSION['user_name'] ?? null,
        'email' => $_SESSION['user_email'] ?? null,
        'role' => $_SESSION['user_role'] ?? null
    ];
}

/**
 * Check if user has specific role
 */
function hasRole($role) {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === $role;
}

/**
 * Logout user
 */
function logout($redirect_url = '/public/index.php?success=logout') {
    session_destroy();
    header("Location: $redirect_url");
    exit;
}
?>