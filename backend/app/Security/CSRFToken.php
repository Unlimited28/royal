<?php

namespace App\Security;

/**
 * CSRF Token Management
 * Generates and validates CSRF tokens for form protection
 */
class CSRFToken {
    
    private static $tokenName = '_csrf_token';
    private static $tokenLifetime = 3600; // 1 hour
    
    /**
     * Generate CSRF token
     */
    public static function generate() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $timestamp = time();
        
        $_SESSION[self::$tokenName] = [
            'token' => $token,
            'timestamp' => $timestamp
        ];
        
        return $token;
    }
    
    /**
     * Get current CSRF token (generate if not exists)
     */
    public static function get() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Check if token exists and is valid
        if (!isset($_SESSION[self::$tokenName]) || 
            !self::isValidTimestamp($_SESSION[self::$tokenName]['timestamp'])) {
            return self::generate();
        }
        
        return $_SESSION[self::$tokenName]['token'];
    }
    
    /**
     * Validate CSRF token
     */
    public static function validate($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION[self::$tokenName])) {
            return false;
        }
        
        $sessionToken = $_SESSION[self::$tokenName];
        
        // Check timestamp
        if (!self::isValidTimestamp($sessionToken['timestamp'])) {
            unset($_SESSION[self::$tokenName]);
            return false;
        }
        
        // Compare tokens using hash_equals to prevent timing attacks
        return hash_equals($sessionToken['token'], $token);
    }
    
    /**
     * Validate token from request
     */
    public static function validateRequest() {
        $token = $_POST[self::$tokenName] ?? $_GET[self::$tokenName] ?? null;
        
        if (!$token) {
            return false;
        }
        
        return self::validate($token);
    }
    
    /**
     * Get HTML input field for CSRF token
     */
    public static function getHiddenInput() {
        $token = self::get();
        return '<input type="hidden" name="' . self::$tokenName . '" value="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Get token name for forms
     */
    public static function getTokenName() {
        return self::$tokenName;
    }
    
    /**
     * Check if timestamp is valid
     */
    private static function isValidTimestamp($timestamp) {
        return (time() - $timestamp) <= self::$tokenLifetime;
    }
    
    /**
     * Clear CSRF token
     */
    public static function clear() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        unset($_SESSION[self::$tokenName]);
    }
}