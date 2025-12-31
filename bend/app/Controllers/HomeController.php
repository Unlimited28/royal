<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Home Controller
 */
class HomeController extends Controller {
    
    /**
     * Show homepage
     */
    public function index() {
        $data = [
            'title' => 'Welcome - ' . APP_NAME,
            'user' => $this->getCurrentUser()
        ];
        
        $this->render('home.index', $data);
    }
}