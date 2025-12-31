<?php

namespace App\Core;

/**
 * Template rendering system for PHP views
 */
class View {
    private $viewPath;
    private $data = [];
    private $sections = [];
    private $currentSection = null;
    
    public function __construct() {
        $this->viewPath = VIEWS_PATH;
    }
    
    /**
     * Render a view
     */
    public function render($view, $data = []) {
        $this->data = array_merge($this->data, $data);
        
        $viewFile = $this->findViewFile($view);
        
        if (!$viewFile) {
            throw new \Exception("View not found: {$view}");
        }
        
        // Extract data to variables
        extract($this->data);
        
        // Start output buffering
        ob_start();
        
        // Include the view file
        include $viewFile;
        
        // Get the content
        $content = ob_get_clean();
        
        echo $content;
    }
    
    /**
     * Find view file
     */
    private function findViewFile($view) {
        // Convert dot notation to directory structure
        $view = str_replace('.', '/', $view);
        
        // Check for .php extension
        $viewFile = $this->viewPath . '/' . $view . '.php';
        
        if (file_exists($viewFile)) {
            return $viewFile;
        }
        
        return null;
    }
    
    /**
     * Include a partial view
     */
    public function include($view, $data = []) {
        $oldData = $this->data;
        $this->data = array_merge($this->data, $data);
        
        $viewFile = $this->findViewFile($view);
        
        if ($viewFile) {
            extract($this->data);
            include $viewFile;
        }
        
        $this->data = $oldData;
    }
    
    /**
     * Start a section
     */
    public function section($name) {
        $this->currentSection = $name;
        ob_start();
    }
    
    /**
     * End a section
     */
    public function endSection() {
        if ($this->currentSection) {
            $this->sections[$this->currentSection] = ob_get_clean();
            $this->currentSection = null;
        }
    }
    
    /**
     * Show a section
     */
    public function show($name, $default = '') {
        return $this->sections[$name] ?? $default;
    }
    
    /**
     * Extend a layout
     */
    public function extend($layout, $data = []) {
        $this->render($layout, $data);
    }
    
    /**
     * Escape HTML
     */
    public function e($value) {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Generate URL
     */
    public function url($path = '') {
        return BASE_URL . '/' . ltrim($path, '/');
    }
    
    /**
     * Generate asset URL
     */
    public function asset($path) {
        return BASE_URL . '/assets/' . ltrim($path, '/');
    }
    
    /**
     * Get flash message
     */
    public function flash() {
        if (isset($_SESSION['flash'])) {
            $flash = $_SESSION['flash'];
            unset($_SESSION['flash']);
            return $flash;
        }
        return null;
    }
    
    /**
     * Get CSRF token
     */
    public function csrf() {
        return $_SESSION['csrf_token'] ?? '';
    }
    
    /**
     * Generate CSRF field
     */
    public function csrfField() {
        $token = $this->csrf();
        return "<input type='hidden' name='csrf_token' value='{$token}'>";
    }
    
    /**
     * Check if user is authenticated
     */
    public function auth() {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }
    
    /**
     * Get current user
     */
    public function user() {
        if (!$this->auth()) {
            return null;
        }
        
        // Cache user data in session to avoid repeated DB queries
        if (!isset($_SESSION['user_data'])) {
            $_SESSION['user_data'] = DB::fetchOne(
                "SELECT * FROM users WHERE id = ?",
                [$_SESSION['user_id']]
            );
        }
        
        return $_SESSION['user_data'];
    }
    
    /**
     * Format date
     */
    public function formatDate($date, $format = 'Y-m-d H:i:s') {
        if (!$date) return '';
        
        if (is_string($date)) {
            $date = new \DateTime($date);
        }
        
        return $date->format($format);
    }
    
    /**
     * Format currency
     */
    public function formatCurrency($amount, $currency = '$') {
        return $currency . number_format($amount, 2);
    }
    
    /**
     * Truncate text
     */
    public function truncate($text, $length = 100, $suffix = '...') {
        if (strlen($text) <= $length) {
            return $text;
        }
        
        return substr($text, 0, $length) . $suffix;
    }
    
    /**
     * Generate pagination links
     */
    public function pagination($pagination, $baseUrl = '') {
        if (!$pagination || $pagination['total_pages'] <= 1) {
            return '';
        }
        
        $currentPage = $pagination['current_page'];
        $totalPages = $pagination['total_pages'];
        $baseUrl = rtrim($baseUrl, '/') . '?page=';
        
        $html = '<nav aria-label="Page navigation">';
        $html .= '<ul class="pagination">';
        
        // Previous button
        if ($pagination['has_prev']) {
            $prevPage = $currentPage - 1;
            $html .= "<li class='page-item'><a class='page-link' href='{$baseUrl}{$prevPage}'>Previous</a></li>";
        } else {
            $html .= "<li class='page-item disabled'><span class='page-link'>Previous</span></li>";
        }
        
        // Page numbers
        $start = max(1, $currentPage - 2);
        $end = min($totalPages, $currentPage + 2);
        
        for ($i = $start; $i <= $end; $i++) {
            if ($i == $currentPage) {
                $html .= "<li class='page-item active'><span class='page-link'>{$i}</span></li>";
            } else {
                $html .= "<li class='page-item'><a class='page-link' href='{$baseUrl}{$i}'>{$i}</a></li>";
            }
        }
        
        // Next button
        if ($pagination['has_next']) {
            $nextPage = $currentPage + 1;
            $html .= "<li class='page-item'><a class='page-link' href='{$baseUrl}{$nextPage}'>Next</a></li>";
        } else {
            $html .= "<li class='page-item disabled'><span class='page-link'>Next</span></li>";
        }
        
        $html .= '</ul>';
        $html .= '</nav>';
        
        return $html;
    }
    
    /**
     * Include CSS file
     */
    public function css($file) {
        $url = $this->asset("css/{$file}");
        return "<link rel='stylesheet' href='{$url}'>";
    }
    
    /**
     * Include JS file
     */
    public function js($file) {
        $url = $this->asset("js/{$file}");
        return "<script src='{$url}'></script>";
    }
    
    /**
     * Generate select options
     */
    public function options($items, $selected = null, $valueKey = null, $labelKey = null) {
        $html = '';
        
        foreach ($items as $key => $item) {
            if (is_array($item)) {
                $value = $valueKey ? $item[$valueKey] : $key;
                $label = $labelKey ? $item[$labelKey] : $item;
            } else {
                $value = $key;
                $label = $item;
            }
            
            $selectedAttr = ($value == $selected) ? 'selected' : '';
            $html .= "<option value='{$value}' {$selectedAttr}>{$label}</option>";
        }
        
        return $html;
    }
}