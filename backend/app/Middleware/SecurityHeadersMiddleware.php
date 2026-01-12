<?php

namespace App\Middleware;

/**
 * Security Headers Middleware
 * Adds comprehensive security headers to protect against common attacks
 */
class SecurityHeadersMiddleware {
    
    /**
     * Apply security headers
     */
    public static function apply() {
        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Prevent clickjacking
        header('X-Frame-Options: DENY');
        
        // XSS Protection
        header('X-XSS-Protection: 1; mode=block');
        
        // HTTPS Strict Transport Security (only if HTTPS)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
        
        // Content Security Policy
        $csp = self::getContentSecurityPolicy();
        header("Content-Security-Policy: $csp");
        
        // Referrer Policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Permissions Policy (formerly Feature Policy)
        header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
        
        // Remove server information
        header_remove('X-Powered-By');
        header_remove('Server');
        
        // Cache control for sensitive pages
        if (self::isSensitivePage()) {
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');
        }
    }
    
    /**
     * Get Content Security Policy
     */
    private static function getContentSecurityPolicy() {
        $baseUrl = defined('BASE_URL') ? BASE_URL : 'https://' . $_SERVER['HTTP_HOST'];
        
        $csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://code.jquery.com https://stackpath.bootstrapcdn.com",
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self'",
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ];
        
        return implode('; ', $csp);
    }
    
    /**
     * Check if current page is sensitive (admin, login, etc.)
     */
    private static function isSensitivePage() {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        $sensitivePatterns = [
            '/admin',
            '/login',
            '/register',
            '/dashboard',
            '/profile',
            '/settings',
            '/password'
        ];
        
        foreach ($sensitivePatterns as $pattern) {
            if (strpos($uri, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }
}