<?php
/**
 * Pagination Utility Class
 * Provides reusable pagination functionality
 */

class Pagination {
    private $total_records;
    private $records_per_page;
    private $current_page;
    private $total_pages;
    private $offset;
    
    public function __construct($total_records, $records_per_page = 10, $current_page = 1) {
        $this->total_records = (int)$total_records;
        $this->records_per_page = (int)$records_per_page;
        $this->current_page = max(1, (int)$current_page);
        $this->total_pages = ceil($this->total_records / $this->records_per_page);
        $this->current_page = min($this->current_page, $this->total_pages);
        $this->offset = ($this->current_page - 1) * $this->records_per_page;
    }
    
    public function getOffset() {
        return $this->offset;
    }
    
    public function getLimit() {
        return $this->records_per_page;
    }
    
    public function getCurrentPage() {
        return $this->current_page;
    }
    
    public function getTotalPages() {
        return $this->total_pages;
    }
    
    public function getTotalRecords() {
        return $this->total_records;
    }
    
    public function hasNextPage() {
        return $this->current_page < $this->total_pages;
    }
    
    public function hasPreviousPage() {
        return $this->current_page > 1;
    }
    
    public function getNextPage() {
        return $this->hasNextPage() ? $this->current_page + 1 : null;
    }
    
    public function getPreviousPage() {
        return $this->hasPreviousPage() ? $this->current_page - 1 : null;
    }
    
    /**
     * Generate pagination HTML
     */
    public function render($base_url = '', $show_info = true) {
        if ($this->total_pages <= 1) {
            return '';
        }
        
        $html = '<nav aria-label="Pagination Navigation" class="pagination-wrapper">';
        
        // Show pagination info
        if ($show_info) {
            $start = $this->offset + 1;
            $end = min($this->offset + $this->records_per_page, $this->total_records);
            $html .= '<div class="pagination-info">';
            $html .= "Showing {$start} to {$end} of {$this->total_records} results";
            $html .= '</div>';
        }
        
        $html .= '<ul class="pagination">';
        
        // Previous button
        if ($this->hasPreviousPage()) {
            $prev_url = $this->buildUrl($base_url, $this->getPreviousPage());
            $html .= '<li class="page-item">';
            $html .= '<a class="page-link" href="' . $prev_url . '" aria-label="Previous">';
            $html .= '<span aria-hidden="true">&laquo;</span>';
            $html .= '</a></li>';
        } else {
            $html .= '<li class="page-item disabled">';
            $html .= '<span class="page-link" aria-label="Previous">';
            $html .= '<span aria-hidden="true">&laquo;</span>';
            $html .= '</span></li>';
        }
        
        // Page numbers
        $start_page = max(1, $this->current_page - 2);
        $end_page = min($this->total_pages, $this->current_page + 2);
        
        // First page
        if ($start_page > 1) {
            $url = $this->buildUrl($base_url, 1);
            $html .= '<li class="page-item">';
            $html .= '<a class="page-link" href="' . $url . '">1</a>';
            $html .= '</li>';
            
            if ($start_page > 2) {
                $html .= '<li class="page-item disabled">';
                $html .= '<span class="page-link">...</span>';
                $html .= '</li>';
            }
        }
        
        // Page range
        for ($i = $start_page; $i <= $end_page; $i++) {
            $url = $this->buildUrl($base_url, $i);
            $active_class = ($i == $this->current_page) ? ' active' : '';
            
            $html .= '<li class="page-item' . $active_class . '">';
            if ($i == $this->current_page) {
                $html .= '<span class="page-link" aria-current="page">' . $i . '</span>';
            } else {
                $html .= '<a class="page-link" href="' . $url . '">' . $i . '</a>';
            }
            $html .= '</li>';
        }
        
        // Last page
        if ($end_page < $this->total_pages) {
            if ($end_page < $this->total_pages - 1) {
                $html .= '<li class="page-item disabled">';
                $html .= '<span class="page-link">...</span>';
                $html .= '</li>';
            }
            
            $url = $this->buildUrl($base_url, $this->total_pages);
            $html .= '<li class="page-item">';
            $html .= '<a class="page-link" href="' . $url . '">' . $this->total_pages . '</a>';
            $html .= '</li>';
        }
        
        // Next button
        if ($this->hasNextPage()) {
            $next_url = $this->buildUrl($base_url, $this->getNextPage());
            $html .= '<li class="page-item">';
            $html .= '<a class="page-link" href="' . $next_url . '" aria-label="Next">';
            $html .= '<span aria-hidden="true">&raquo;</span>';
            $html .= '</a></li>';
        } else {
            $html .= '<li class="page-item disabled">';
            $html .= '<span class="page-link" aria-label="Next">';
            $html .= '<span aria-hidden="true">&raquo;</span>';
            $html .= '</span></li>';
        }
        
        $html .= '</ul></nav>';
        
        return $html;
    }
    
    /**
     * Build URL with page parameter
     */
    private function buildUrl($base_url, $page) {
        $separator = strpos($base_url, '?') !== false ? '&' : '?';
        return $base_url . $separator . 'page=' . $page;
    }
    
    /**
     * Get pagination data as array
     */
    public function toArray() {
        return [
            'current_page' => $this->current_page,
            'total_pages' => $this->total_pages,
            'total_records' => $this->total_records,
            'records_per_page' => $this->records_per_page,
            'has_next' => $this->hasNextPage(),
            'has_previous' => $this->hasPreviousPage(),
            'next_page' => $this->getNextPage(),
            'previous_page' => $this->getPreviousPage(),
            'offset' => $this->offset
        ];
    }
}

/**
 * Helper function to create pagination
 */
function paginate($total_records, $per_page = 10, $current_page = null) {
    if ($current_page === null) {
        $current_page = $_GET['page'] ?? 1;
    }
    
    return new Pagination($total_records, $per_page, $current_page);
}