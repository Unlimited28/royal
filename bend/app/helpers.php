<?php
/**
 * Global Helper Functions
 */

/**
 * Generate secure random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Generate secure hash
 */
function secureHash($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify secure hash
 */
function verifyHash($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate CSRF token
 */
function csrf_token() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verify_csrf_token($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Sanitize input
 */
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate password strength
 */
function is_strong_password($password) {
    if (strlen($password) < PASSWORD_MIN_LENGTH) {
        return false;
    }
    
    // Check for at least one uppercase letter, one lowercase letter, one number
    if (!preg_match('/[A-Z]/', $password) || 
        !preg_match('/[a-z]/', $password) || 
        !preg_match('/[0-9]/', $password)) {
        return false;
    }
    
    return true;
}

/**
 * Generate password reset token
 */
function generate_reset_token() {
    return bin2hex(random_bytes(32));
}

/**
 * Generate email verification token
 */
function generate_verification_token() {
    return bin2hex(random_bytes(32));
}

/**
 * Get user IP address
 */
function get_client_ip() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, 
                    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Log security event
 */
function log_security_event($type, $description, $userId = null, $data = null) {
    $ipAddress = get_client_ip();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    
    DB::query(
        "INSERT INTO security_logs (user_id, type, description, ip_address, user_agent, data, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [$userId, $type, $description, $ipAddress, $userAgent, json_encode($data)]
    );
}

/**
 * Check rate limit
 */
function check_rate_limit($key, $limit, $window = 60) {
    $cacheKey = "rate_limit:{$key}:" . floor(time() / $window);
    
    if (!isset($_SESSION[$cacheKey])) {
        $_SESSION[$cacheKey] = 0;
    }
    
    $_SESSION[$cacheKey]++;
    
    return $_SESSION[$cacheKey] <= $limit;
}

/**
 * Send email (basic implementation)
 */
function send_email($to, $subject, $body, $isHtml = true) {
    $headers = [
        'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . FROM_EMAIL,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    if ($isHtml) {
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
    }
    
    return mail($to, $subject, $body, implode("\r\n", $headers));
}

/**
 * Upload file securely
 */
function upload_file($file, $destination, $allowedTypes = [], $maxSize = null) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Upload error: ' . $file['error']];
    }
    
    $maxSize = $maxSize ?: MAX_FILE_SIZE;
    
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => 'File size exceeds limit'];
    }
    
    $fileInfo = pathinfo($file['name']);
    $extension = strtolower($fileInfo['extension']);
    
    if (!empty($allowedTypes) && !in_array($extension, $allowedTypes)) {
        return ['success' => false, 'error' => 'File type not allowed'];
    }
    
    // Generate unique filename
    $fileName = uniqid() . '_' . time() . '.' . $extension;
    $filePath = $destination . '/' . $fileName;
    
    // Create directory if it doesn't exist
    if (!is_dir(dirname($filePath))) {
        mkdir(dirname($filePath), 0755, true);
    }
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return [
            'success' => true,
            'filename' => $fileName,
            'path' => $filePath,
            'size' => $file['size']
        ];
    }
    
    return ['success' => false, 'error' => 'Failed to move uploaded file'];
}

/**
 * Format bytes to human readable
 */
function format_bytes($size, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    
    return round($size, $precision) . ' ' . $units[$i];
}

/**
 * Generate UUID v4
 */
function generate_uuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Create slug from string
 */
function create_slug($string) {
    $slug = strtolower(trim($string));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Time ago function
 */
function time_ago($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time/60) . ' minutes ago';
    if ($time < 86400) return floor($time/3600) . ' hours ago';
    if ($time < 2592000) return floor($time/86400) . ' days ago';
    if ($time < 31536000) return floor($time/2592000) . ' months ago';
    
    return floor($time/31536000) . ' years ago';
}

/**
 * Truncate text
 */
function truncate_text($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    
    return substr($text, 0, $length) . $suffix;
}

/**
 * Generate random password
 */
function generate_password($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    $password = '';
    
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[random_int(0, strlen($chars) - 1)];
    }
    
    return $password;
}

/**
 * Check if user is admin or higher
 */
function is_admin_or_higher($role) {
    $hierarchy = ['ambassador', 'president', 'admin', 'superadmin'];
    $userLevel = array_search($role, $hierarchy);
    $adminLevel = array_search('admin', $hierarchy);
    
    return $userLevel !== false && $adminLevel !== false && $userLevel >= $adminLevel;
}

/**
 * Get rank name by ID
 */
function get_rank_name($rankId) {
    return RA_RANKS[$rankId] ?? 'Unknown Rank';
}

/**
 * Get role name
 */
function get_role_name($role) {
    return USER_ROLES[$role] ?? 'Unknown Role';
}

/**
 * Format currency
 */
function format_currency($amount, $currency = '$') {
    return $currency . number_format($amount, 2);
}

/**
 * Check if string is JSON
 */
function is_json($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

/**
 * Debug function (only in development)
 */
function dd($data) {
    if (APP_ENV === 'development') {
        echo '<pre>';
        var_dump($data);
        echo '</pre>';
        die();
    }
}

/**
 * Redirect helper
 */
function redirect($url, $statusCode = 302) {
    if (!headers_sent()) {
        header("Location: {$url}", true, $statusCode);
        exit;
    }
}

/**
 * Get base URL
 */
function base_url($path = '') {
    return BASE_URL . '/' . ltrim($path, '/');
}

/**
 * Get asset URL  
 */
function asset_url($path) {
    return BASE_URL . '/assets/' . ltrim($path, '/');
}