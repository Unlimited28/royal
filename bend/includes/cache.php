<?php
/**
 * File-based Caching System
 * Provides caching functionality with fallback for Redis
 */

class Cache {
    private static $instance = null;
    private $cache_dir;
    private $default_ttl = 3600; // 1 hour default
    
    private function __construct() {
        $this->cache_dir = dirname(__DIR__) . '/cache/';
        if (!is_dir($this->cache_dir)) {
            mkdir($this->cache_dir, 0755, true);
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Store data in cache
     */
    public function set($key, $data, $ttl = null) {
        $ttl = $ttl ?? $this->default_ttl;
        $cache_file = $this->getCacheFile($key);
        
        $cache_data = [
            'data' => $data,
            'expires' => time() + $ttl,
            'created' => time()
        ];
        
        return file_put_contents($cache_file, serialize($cache_data), LOCK_EX) !== false;
    }
    
    /**
     * Retrieve data from cache
     */
    public function get($key, $default = null) {
        $cache_file = $this->getCacheFile($key);
        
        if (!file_exists($cache_file)) {
            return $default;
        }
        
        $cache_data = unserialize(file_get_contents($cache_file));
        
        if (!$cache_data || time() > $cache_data['expires']) {
            $this->delete($key);
            return $default;
        }
        
        return $cache_data['data'];
    }
    
    /**
     * Check if cache key exists and is valid
     */
    public function has($key) {
        return $this->get($key) !== null;
    }
    
    /**
     * Delete cache entry
     */
    public function delete($key) {
        $cache_file = $this->getCacheFile($key);
        if (file_exists($cache_file)) {
            return unlink($cache_file);
        }
        return true;
    }
    
    /**
     * Clear all cache
     */
    public function clear() {
        $files = glob($this->cache_dir . '*.cache');
        foreach ($files as $file) {
            unlink($file);
        }
        return true;
    }
    
    /**
     * Remember pattern - get from cache or execute callback
     */
    public function remember($key, $callback, $ttl = null) {
        $data = $this->get($key);
        
        if ($data === null) {
            $data = $callback();
            $this->set($key, $data, $ttl);
        }
        
        return $data;
    }
    
    /**
     * Cache database query results
     */
    public function query($sql, $params = [], $ttl = null) {
        $cache_key = 'query_' . md5($sql . serialize($params));
        
        return $this->remember($cache_key, function() use ($sql, $params) {
            global $pdo;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }, $ttl);
    }
    
    /**
     * Get cache file path
     */
    private function getCacheFile($key) {
        return $this->cache_dir . md5($key) . '.cache';
    }
    
    /**
     * Clean expired cache entries
     */
    public function cleanExpired() {
        $files = glob($this->cache_dir . '*.cache');
        $cleaned = 0;
        
        foreach ($files as $file) {
            $cache_data = unserialize(file_get_contents($file));
            if ($cache_data && time() > $cache_data['expires']) {
                unlink($file);
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Get cache statistics
     */
    public function getStats() {
        $files = glob($this->cache_dir . '*.cache');
        $total_size = 0;
        $expired = 0;
        
        foreach ($files as $file) {
            $total_size += filesize($file);
            $cache_data = unserialize(file_get_contents($file));
            if ($cache_data && time() > $cache_data['expires']) {
                $expired++;
            }
        }
        
        return [
            'total_entries' => count($files),
            'expired_entries' => $expired,
            'total_size' => $total_size,
            'total_size_formatted' => $this->formatBytes($total_size)
        ];
    }
    
    private function formatBytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

// Global cache helper functions
function cache_set($key, $data, $ttl = null) {
    return Cache::getInstance()->set($key, $data, $ttl);
}

function cache_get($key, $default = null) {
    return Cache::getInstance()->get($key, $default);
}

function cache_remember($key, $callback, $ttl = null) {
    return Cache::getInstance()->remember($key, $callback, $ttl);
}

function cache_forget($key) {
    return Cache::getInstance()->delete($key);
}

function cache_flush() {
    return Cache::getInstance()->clear();
}