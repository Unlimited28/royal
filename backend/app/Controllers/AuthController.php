<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Authentication Controller - Sample Implementation for Login Route
 */
class AuthController extends Controller {
    
    /**
     * Show login form
     */
    public function showLogin() {
        // If already authenticated, redirect to dashboard
        if ($this->isAuthenticated()) {
            $this->redirect('/dashboard');
        }
        
        $data = [
            'title' => 'Login - ' . APP_NAME,
            'error' => $_GET['error'] ?? null,
            'message' => $_GET['message'] ?? null,
            'security_error' => $_GET['security_error'] ?? null,
            'timeout' => $_GET['timeout'] ?? null
        ];
        
        $this->render('auth.login', $data);
    }
    
    /**
     * Process login
     */
    public function login() {
        // Validate CSRF token
        if (!$this->validateCSRF()) {
            log_security_event('csrf_validation_failed', 'CSRF token validation failed on login');
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/login');
        }
        
        $email = $this->sanitize($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $rememberMe = isset($_POST['remember_me']);
        
        // Validate input
        $validator = new \Validator();
        $valid = $validator->validate([
            'email' => $email,
            'password' => $password
        ], [
            'email' => 'required|email',
            'password' => 'required'
        ]);
        
        if (!$valid) {
            $this->setFlash('Please provide valid email and password.', 'error');
            $this->redirect('/login');
        }
        
        // Rate limiting
        $clientIp = get_client_ip();
        if (!RateLimiter::check("login:{$clientIp}", RATE_LIMIT_LOGIN)) {
            log_security_event('rate_limit_exceeded', 'Login rate limit exceeded', null, ['ip' => $clientIp]);
            $this->setFlash('Too many login attempts. Please try again later.', 'error');
            $this->redirect('/login');
        }
        
        // Check account lockout
        if (AccountLockout::isLocked($email)) {
            log_security_event('locked_account_access_attempt', 'Attempt to access locked account', null, ['email' => $email]);
            $this->setFlash('Account is temporarily locked due to multiple failed login attempts.', 'error');
            $this->redirect('/login');
        }
        
        // Find user
        $user = DB::fetchOne(
            "SELECT * FROM users WHERE email = ? AND status = 'active'",
            [$email]
        );
        
        if (!$user || !verifyHash($password, $user['password'])) {
            // Record failed attempt
            AccountLockout::recordFailedAttempt($email);
            
            log_security_event('login_failed', 'Failed login attempt', null, [
                'email' => $email,
                'ip' => $clientIp
            ]);
            
            $this->setFlash('Invalid email or password.', 'error');
            $this->redirect('/login');
        }
        
        // Check if 2FA is enabled
        if (!empty($user['two_factor_secret']) && !isset($_POST['two_factor_code'])) {
            $_SESSION['temp_user_id'] = $user['id'];
            $this->redirect('/login/2fa');
        }
        
        // Validate 2FA if provided
        if (!empty($user['two_factor_secret']) && isset($_POST['two_factor_code'])) {
            if (!TwoFactorAuth::verifyToken($user['two_factor_secret'], $_POST['two_factor_code'])) {
                log_security_event('2fa_failed', '2FA verification failed', $user['id']);
                $this->setFlash('Invalid two-factor authentication code.', 'error');
                $this->redirect('/login');
            }
        }
        
        // Successful login
        AccountLockout::clearFailedAttempts($email);
        RateLimiter::reset("login:{$clientIp}");
        
        // Create session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['last_activity'] = time();
        $_SESSION['regenerate_id'] = true;
        
        // Handle remember me
        if ($rememberMe) {
            RememberToken::generate($user['id']);
        }
        
        // Update last login
        DB::query(
            "UPDATE users SET last_login = NOW(), last_login_ip = ? WHERE id = ?",
            [$clientIp, $user['id']]
        );
        
        // Log successful login
        log_security_event('login_success', 'User logged in successfully', $user['id']);
        
        // Redirect based on role
        $redirectUrl = $this->getRedirectUrl($user['role']);
        $this->redirect($redirectUrl);
    }
    
    /**
     * Show registration form
     */
    public function showRegister() {
        if ($this->isAuthenticated()) {
            $this->redirect('/dashboard');
        }
        
        $data = [
            'title' => 'Register - ' . APP_NAME,
            'associations' => ASSOCIATIONS,
            'ranks' => RA_RANKS
        ];
        
        $this->render('auth.register', $data);
    }
    
    /**
     * Process registration
     */
    public function register() {
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/register');
        }
        
        $data = [
            'first_name' => $this->sanitize($_POST['first_name'] ?? ''),
            'last_name' => $this->sanitize($_POST['last_name'] ?? ''),
            'email' => $this->sanitize($_POST['email'] ?? ''),
            'password' => $_POST['password'] ?? '',
            'password_confirmation' => $_POST['password_confirmation'] ?? '',
            'association' => $this->sanitize($_POST['association'] ?? ''),
            'phone' => $this->sanitize($_POST['phone'] ?? ''),
            'current_rank' => (int)($_POST['current_rank'] ?? 1),
            'role' => 'ambassador',
            'passcode' => $_POST['passcode'] ?? ''
        ];
        
        // Check for special roles
        if (!empty($data['passcode'])) {
            if ($data['passcode'] === SUPER_ADMIN_PASSCODE) {
                $data['role'] = 'superadmin';
            } elseif ($data['passcode'] === PRESIDENT_PASSCODE) {
                $data['role'] = 'president';
            }
        }
        
        // Validate input
        $validator = new \Validator();
        $valid = $validator->validate($data, [
            'first_name' => 'required|max:50',
            'last_name' => 'required|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|strong_password',
            'association' => 'required',
            'phone' => 'required|max:20'
        ]);
        
        if (!$valid) {
            $errors = implode(' ', array_map(function($fieldErrors) {
                return implode(' ', $fieldErrors);
            }, $validator->getErrors()));
            
            $this->setFlash($errors, 'error');
            $this->redirect('/register');
        }
        
        // Check password confirmation
        if ($data['password'] !== $data['password_confirmation']) {
            $this->setFlash('Password confirmation does not match.', 'error');
            $this->redirect('/register');
        }
        
        // Rate limiting
        $clientIp = get_client_ip();
        if (!RateLimiter::check("register:{$clientIp}", 3)) {
            $this->setFlash('Too many registration attempts. Please try again later.', 'error');
            $this->redirect('/register');
        }
        
        try {
            // Hash password
            $data['password'] = secureHash($data['password']);
            unset($data['password_confirmation'], $data['passcode']);
            
            // Generate verification token
            $data['email_verification_token'] = generate_verification_token();
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['status'] = 'pending';
            
            // Insert user
            $userId = DB::insert("
                INSERT INTO users (first_name, last_name, email, password, association, phone, current_rank, role, email_verification_token, status, created_at)
                VALUES (:first_name, :last_name, :email, :password, :association, :phone, :current_rank, :role, :email_verification_token, :status, :created_at)
            ", $data);
            
            // Send verification email
            $this->sendVerificationEmail($data['email'], $data['first_name'], $data['email_verification_token']);
            
            // Log registration
            log_security_event('user_registered', 'New user registered', $userId, [
                'email' => $data['email'],
                'role' => $data['role']
            ]);
            
            $this->setFlash('Registration successful! Please check your email to verify your account.', 'success');
            $this->redirect('/login');
            
        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            $this->setFlash('Registration failed. Please try again.', 'error');
            $this->redirect('/register');
        }
    }
    
    /**
     * Logout user
     */
    public function logout() {
        if ($this->isAuthenticated()) {
            $userId = $_SESSION['user_id'];
            
            // Revoke remember tokens
            RememberToken::revokeAll($userId);
            
            // Log logout
            log_security_event('logout', 'User logged out', $userId);
            
            // Clear session
            session_unset();
            session_destroy();
        }
        
        $this->redirect('/login');
    }
    
    /**
     * Get redirect URL based on user role
     */
    private function getRedirectUrl($role) {
        switch ($role) {
            case 'superadmin':
                return '/superadmin/dashboard';
            case 'admin':
                return '/admin/dashboard';
            case 'president':
                return '/president/dashboard';
            case 'ambassador':
            default:
                return '/ambassador/dashboard';
        }
    }
    
    /**
     * Send verification email
     */
    private function sendVerificationEmail($email, $firstName, $token) {
        $verificationUrl = base_url("verify-email/{$token}");
        
        $subject = 'Verify Your Email - ' . APP_NAME;
        $body = "
            <h2>Welcome to " . APP_NAME . "!</h2>
            <p>Hello {$firstName},</p>
            <p>Thank you for registering. Please click the link below to verify your email address:</p>
            <p><a href='{$verificationUrl}'>Verify Email Address</a></p>
            <p>If you cannot click the link, copy and paste this URL into your browser:</p>
            <p>{$verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
        ";
        
        send_email($email, $subject, $body, true);
    }
}