<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Payment System Controller - Receipt Upload & Verification
 */
class PaymentController extends Controller {
    
    private $uploadDir = 'uploads/receipts/';
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB
    
    /**
     * Payment dashboard based on user role
     */
    public function dashboard() {
        $userRole = $_SESSION['user_role'];
        $userId = $_SESSION['user_id'];
        
        $data = [
            'title' => 'Payment Dashboard - ' . APP_NAME,
            'user_role' => $userRole
        ];
        
        switch ($userRole) {
            case 'superadmin':
                $data['pending_payments'] = $this->getPendingPayments();
                $data['recent_payments'] = $this->getRecentPayments(50);
                $data['payment_statistics'] = $this->getPaymentStatistics();
                break;
                
            case 'president':
                $data['association_payments'] = $this->getAssociationPayments($userId);
                $data['user_payments'] = $this->getUserPayments($userId);
                break;
                
            case 'ambassador':
            default:
                $data['user_payments'] = $this->getUserPayments($userId);
                break;
        }
        
        $this->render('payment.dashboard', $data);
    }
    
    /**
     * Show upload payment form
     */
    public function upload() {
        $data = [
            'title' => 'Upload Payment Receipt - ' . APP_NAME,
            'payment_types' => [
                'dues' => 'Association Dues',
                'exam' => 'Exam Fees',
                'camp' => 'Camp Fees',
                'registration' => 'Registration Fees'
            ]
        ];
        
        $this->render('payment.upload', $data);
    }
    
    /**
     * Process payment upload
     */
    public function store() {
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/payment/upload');
        }
        
        $userId = $_SESSION['user_id'];
        
        $data = [
            'user_id' => $userId,
            'type' => $_POST['type'] ?? '',
            'amount' => (float)($_POST['amount'] ?? 0),
            'description' => $this->sanitize($_POST['description'] ?? ''),
            'reference_number' => $this->generateReferenceNumber()
        ];
        
        // Validate input
        if (empty($data['type']) || $data['amount'] <= 0) {
            $this->setFlash('Please provide valid payment type and amount.', 'error');
            $this->redirect('/payment/upload');
        }
        
        // Handle file upload
        if (!isset($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
            $this->setFlash('Please upload a valid receipt file.', 'error');
            $this->redirect('/payment/upload');
        }
        
        $uploadResult = $this->handleFileUpload($_FILES['receipt']);
        
        if (!$uploadResult['success']) {
            $this->setFlash($uploadResult['message'], 'error');
            $this->redirect('/payment/upload');
        }
        
        $data['receipt_path'] = $uploadResult['file_path'];
        
        try {
            $paymentId = DB::insert("
                INSERT INTO payments (
                    user_id, type, amount, description, receipt_path, 
                    reference_number, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            ", [
                $data['user_id'], $data['type'], $data['amount'], 
                $data['description'], $data['receipt_path'], $data['reference_number']
            ]);
            
            // Send notification to super admin
            $this->notifyPaymentUpload($paymentId, $data);
            
            // Log payment upload
            log_security_event('payment_uploaded', 'User uploaded payment receipt', $userId, [
                'payment_id' => $paymentId,
                'type' => $data['type'],
                'amount' => $data['amount']
            ]);
            
            $this->setFlash('Payment receipt uploaded successfully! Reference: ' . $data['reference_number'], 'success');
            $this->redirect('/payment/dashboard');
            
        } catch (Exception $e) {
            // Delete uploaded file if database insert fails
            if (file_exists($data['receipt_path'])) {
                unlink($data['receipt_path']);
            }
            
            error_log("Payment upload error: " . $e->getMessage());
            $this->setFlash('Error uploading payment. Please try again.', 'error');
            $this->redirect('/payment/upload');
        }
    }
    
    /**
     * Finance dashboard for Super Admin
     */
    public function finance() {
        $this->requireRole(['superadmin']);
        
        $data = [
            'title' => 'Finance Dashboard - ' . APP_NAME,
            'pending_payments' => $this->getPendingPayments(),
            'recent_payments' => $this->getRecentPayments(100),
            'statistics' => $this->getFinanceStatistics(),
            'monthly_summary' => $this->getMonthlyPaymentSummary()
        ];
        
        $this->render('payment.finance', $data);
    }
    
    /**
     * Verify payment (Super Admin only)
     */
    public function verify($paymentId) {
        $this->requireRole(['superadmin']);
        
        if (!$this->validateCSRF()) {
            $this->jsonResponse(['success' => false, 'message' => 'Security error']);
        }
        
        $action = $_POST['action'] ?? '';
        $notes = $this->sanitize($_POST['notes'] ?? '');
        $verifiedBy = $_SESSION['user_id'];
        
        if (!in_array($action, ['approve', 'reject'])) {
            $this->jsonResponse(['success' => false, 'message' => 'Invalid action']);
        }
        
        $status = ($action === 'approve') ? 'approved' : 'rejected';
        
        try {
            $updated = DB::execute("
                UPDATE payments 
                SET status = ?, verified_by = ?, verified_at = NOW(), notes = ?
                WHERE id = ?
            ", [$status, $verifiedBy, $notes, $paymentId]);
            
            if ($updated) {
                // Get payment details for notification
                $payment = DB::fetchOne("
                    SELECT p.*, u.full_name, u.email 
                    FROM payments p 
                    JOIN users u ON p.user_id = u.id 
                    WHERE p.id = ?
                ", [$paymentId]);
                
                // Send notification to user
                $this->notifyPaymentVerification($payment, $status, $notes);
                
                // Log verification
                log_security_event('payment_verified', "Payment {$status}", $verifiedBy, [
                    'payment_id' => $paymentId,
                    'status' => $status,
                    'user_id' => $payment['user_id']
                ]);
                
                $this->jsonResponse([
                    'success' => true, 
                    'message' => "Payment {$status} successfully"
                ]);
            } else {
                $this->jsonResponse(['success' => false, 'message' => 'Payment not found']);
            }
            
        } catch (Exception $e) {
            error_log("Payment verification error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error processing verification']);
        }
    }
    
    /**
     * View payment details
     */
    public function view($paymentId) {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        // Check permissions
        $whereClause = "p.id = ?";
        $params = [$paymentId];
        
        if (!in_array($userRole, ['superadmin'])) {
            $whereClause .= " AND p.user_id = ?";
            $params[] = $userId;
        }
        
        $payment = DB::fetchOne("
            SELECT p.*, u.full_name, u.unique_id, u.email,
                   v.full_name as verified_by_name
            FROM payments p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN users v ON p.verified_by = v.id
            WHERE {$whereClause}
        ", $params);
        
        if (!$payment) {
            $this->setFlash('Payment not found.', 'error');
            $this->redirect('/payment/dashboard');
        }
        
        $data = [
            'title' => 'Payment Details - ' . $payment['reference_number'],
            'payment' => $payment
        ];
        
        $this->render('payment.view', $data);
    }
    
    /**
     * Handle file upload
     */
    private function handleFileUpload($file) {
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
        
        // Validate file type
        if (!in_array($file['type'], $this->allowedTypes)) {
            return [
                'success' => false,
                'message' => 'Invalid file type. Please upload JPG, PNG, GIF, or PDF files only.'
            ];
        }
        
        // Validate file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'success' => false,
                'message' => 'File too large. Maximum size is 5MB.'
            ];
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('receipt_', true) . '.' . $extension;
        $filePath = $this->uploadDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return [
                'success' => true,
                'file_path' => $filePath,
                'filename' => $filename
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error uploading file. Please try again.'
            ];
        }
    }
    
    /**
     * Generate unique reference number
     */
    private function generateReferenceNumber() {
        return 'PAY-' . date('Y') . '-' . strtoupper(uniqid());
    }
    
    /**
     * Get pending payments
     */
    private function getPendingPayments() {
        return DB::fetchAll("
            SELECT p.*, u.full_name, u.unique_id, u.email, a.name as association_name
            FROM payments p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN associations a ON u.association_id = a.id
            WHERE p.status = 'pending'
            ORDER BY p.created_at ASC
        ");
    }
    
    /**
     * Get recent payments
     */
    private function getRecentPayments($limit = 50) {
        return DB::fetchAll("
            SELECT p.*, u.full_name, u.unique_id,
                   v.full_name as verified_by_name
            FROM payments p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN users v ON p.verified_by = v.id
            ORDER BY p.created_at DESC
            LIMIT {$limit}
        ");
    }
    
    /**
     * Get user payments
     */
    private function getUserPayments($userId) {
        return DB::fetchAll("
            SELECT p.*, v.full_name as verified_by_name
            FROM payments p
            LEFT JOIN users v ON p.verified_by = v.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        ", [$userId]);
    }
    
    /**
     * Get association payments
     */
    private function getAssociationPayments($userId) {
        $user = DB::fetchOne("SELECT association_id FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !$user['association_id']) {
            return [];
        }
        
        return DB::fetchAll("
            SELECT p.*, u.full_name, u.unique_id
            FROM payments p
            JOIN users u ON p.user_id = u.id
            WHERE u.association_id = ?
            ORDER BY p.created_at DESC
        ", [$user['association_id']]);
    }
    
    /**
     * Get payment statistics
     */
    private function getPaymentStatistics() {
        return [
            'total_payments' => DB::fetchOne("SELECT COUNT(*) as count FROM payments")['count'],
            'pending_count' => DB::fetchOne("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'")['count'],
            'approved_count' => DB::fetchOne("SELECT COUNT(*) as count FROM payments WHERE status = 'approved'")['count'],
            'total_amount' => DB::fetchOne("SELECT SUM(amount) as total FROM payments WHERE status = 'approved'")['total'] ?? 0
        ];
    }
    
    /**
     * Get finance statistics
     */
    private function getFinanceStatistics() {
        return [
            'total_revenue' => DB::fetchOne("SELECT SUM(amount) as total FROM payments WHERE status = 'approved'")['total'] ?? 0,
            'pending_amount' => DB::fetchOne("SELECT SUM(amount) as total FROM payments WHERE status = 'pending'")['total'] ?? 0,
            'this_month' => DB::fetchOne("SELECT SUM(amount) as total FROM payments WHERE status = 'approved' AND MONTH(created_at) = MONTH(CURRENT_DATE())")['total'] ?? 0,
            'payment_types' => DB::fetchAll("SELECT type, COUNT(*) as count, SUM(amount) as total FROM payments WHERE status = 'approved' GROUP BY type")
        ];
    }
    
    /**
     * Get monthly payment summary
     */
    private function getMonthlyPaymentSummary() {
        return DB::fetchAll("
            SELECT 
                MONTH(created_at) as month,
                YEAR(created_at) as year,
                COUNT(*) as total_payments,
                SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
            FROM payments 
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY YEAR(created_at), MONTH(created_at)
            ORDER BY year DESC, month DESC
        ");
    }
    
    /**
     * Send notification for payment upload
     */
    private function notifyPaymentUpload($paymentId, $paymentData) {
        $user = DB::fetchOne("SELECT full_name FROM users WHERE id = ?", [$paymentData['user_id']]);
        
        $title = "New Payment Receipt Uploaded";
        $message = "Payment receipt uploaded by {$user['full_name']} for {$paymentData['type']} - Amount: ₦" . number_format($paymentData['amount'], 2);
        
        // Notify all super admins
        $this->sendNotification($title, $message, 'payment', 'super_admin', null, $paymentData['user_id']);
    }
    
    /**
     * Send notification for payment verification
     */
    private function notifyPaymentVerification($payment, $status, $notes) {
        $title = "Payment " . ucfirst($status);
        $message = "Your payment (Ref: {$payment['reference_number']}) has been {$status}.";
        
        if (!empty($notes)) {
            $message .= " Notes: {$notes}";
        }
        
        $this->sendNotification($title, $message, 'payment', 'user', $payment['user_id'], $_SESSION['user_id']);
    }
    
    /**
     * Send notification helper
     */
    private function sendNotification($title, $message, $type, $recipientType, $recipientId = null, $senderId = null) {
        DB::insert("
            INSERT INTO notifications (sender_id, title, message, type, recipient_type, recipient_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ", [$senderId, $title, $message, $type, $recipientType, $recipientId]);
    }
    
    /**
     * Require specific role
     */
    private function requireRole($roles) {
        $userRole = $_SESSION['user_role'];
        if (!in_array($userRole, $roles)) {
            $this->setFlash('Access denied.', 'error');
            $this->redirect('/dashboard');
        }
    }
    
    /**
     * JSON response helper
     */
    private function jsonResponse($data) {
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}