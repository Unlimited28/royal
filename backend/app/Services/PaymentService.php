<?php

namespace App\Services;

use App\Core\DB;

/**
 * Payment Service for handling payment verification and processing
 */
class PaymentService {
    
    /**
     * Upload payment receipt
     */
    public static function uploadPayment($userId, $type, $amount, $description, $uploadedFile, $bankReference = null, $paymentDate = null) {
        try {
            DB::beginTransaction();
            
            // Validate file upload
            $uploadResult = self::handleFileUpload($uploadedFile, $userId);
            if (!$uploadResult['success']) {
                DB::rollback();
                return $uploadResult;
            }
            
            // Generate reference number
            $referenceNumber = self::generateReferenceNumber($type);
            
            // Insert payment record
            $paymentId = DB::insert(
                "INSERT INTO payments (user_id, type, amount, description, receipt_path, reference_number, bank_reference, payment_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')",
                [
                    $userId,
                    $type,
                    $amount,
                    $description,
                    $uploadResult['file_path'],
                    $referenceNumber,
                    $bankReference,
                    $paymentDate
                ]
            );
            
            // Get user details for notification
            $user = DB::fetchOne("SELECT full_name, email FROM users WHERE id = ?", [$userId]);
            
            // Send confirmation email
            EmailService::sendPaymentConfirmation(
                $user['email'],
                $user['full_name'],
                ucfirst($type),
                number_format($amount, 2),
                'submitted'
            );
            
            DB::commit();
            
            return [
                'success' => true,
                'payment_id' => $paymentId,
                'reference_number' => $referenceNumber,
                'message' => 'Payment uploaded successfully'
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            error_log("Payment upload failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to upload payment'];
        }
    }
    
    /**
     * Verify payment
     */
    public static function verifyPayment($paymentId, $verifierId, $status, $notes = '') {
        try {
            DB::beginTransaction();
            
            // Get payment details
            $payment = DB::fetchOne(
                "SELECT p.*, u.full_name, u.email FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 WHERE p.id = ?",
                [$paymentId]
            );
            
            if (!$payment) {
                DB::rollback();
                return ['success' => false, 'message' => 'Payment not found'];
            }
            
            // Update payment status
            DB::execute(
                "UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW(), verification_notes = ? WHERE id = ?",
                [$status, $verifierId, $notes, $paymentId]
            );
            
            // Send notification email
            EmailService::sendPaymentConfirmation(
                $payment['email'],
                $payment['full_name'],
                ucfirst($payment['type']),
                number_format($payment['amount'], 2),
                $status
            );
            
            // Log the verification
            DB::insert(
                "INSERT INTO system_logs (event_type, user_id, ip_address, user_agent, event_data) 
                 VALUES ('PAYMENT_VERIFICATION', ?, ?, ?, ?)",
                [
                    $verifierId,
                    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                    json_encode([
                        'payment_id' => $paymentId,
                        'status' => $status,
                        'amount' => $payment['amount'],
                        'type' => $payment['type']
                    ])
                ]
            );
            
            DB::commit();
            
            return [
                'success' => true,
                'message' => "Payment {$status} successfully"
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            error_log("Payment verification failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to verify payment'];
        }
    }
    
    /**
     * Get payment statistics
     */
    public static function getPaymentStats($associationId = null, $dateFrom = null, $dateTo = null) {
        try {
            $whereClause = "WHERE 1=1";
            $params = [];
            
            if ($associationId) {
                $whereClause .= " AND u.association_id = ?";
                $params[] = $associationId;
            }
            
            if ($dateFrom) {
                $whereClause .= " AND p.created_at >= ?";
                $params[] = $dateFrom;
            }
            
            if ($dateTo) {
                $whereClause .= " AND p.created_at <= ?";
                $params[] = $dateTo . ' 23:59:59';
            }
            
            // Total payments by status
            $statusStats = DB::fetchAll(
                "SELECT p.status, COUNT(*) as count, SUM(p.amount) as total_amount 
                 FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 {$whereClause} 
                 GROUP BY p.status",
                $params
            );
            
            // Payments by type
            $typeStats = DB::fetchAll(
                "SELECT p.type, COUNT(*) as count, SUM(p.amount) as total_amount 
                 FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 {$whereClause} 
                 GROUP BY p.type",
                $params
            );
            
            // Recent payments
            $recentPayments = DB::fetchAll(
                "SELECT p.*, u.full_name, u.unique_id, a.name as association_name 
                 FROM payments p 
                 JOIN users u ON p.user_id = u.id 
                 LEFT JOIN associations a ON u.association_id = a.id 
                 {$whereClause} 
                 ORDER BY p.created_at DESC 
                 LIMIT 10",
                $params
            );
            
            return [
                'success' => true,
                'status_stats' => $statusStats,
                'type_stats' => $typeStats,
                'recent_payments' => $recentPayments
            ];
            
        } catch (\Exception $e) {
            error_log("Failed to get payment stats: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get payment statistics'];
        }
    }
    
    /**
     * Handle file upload
     */
    private static function handleFileUpload($uploadedFile, $userId) {
        try {
            // Validate file
            if (!isset($uploadedFile['tmp_name']) || !is_uploaded_file($uploadedFile['tmp_name'])) {
                return ['success' => false, 'message' => 'No file uploaded'];
            }
            
            // Check file size (max 5MB)
            if ($uploadedFile['size'] > 5 * 1024 * 1024) {
                return ['success' => false, 'message' => 'File size too large (max 5MB)'];
            }
            
            // Check file type
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
            finfo_close($finfo);
            
            if (!in_array($mimeType, $allowedTypes)) {
                return ['success' => false, 'message' => 'Invalid file type. Only images and PDF files are allowed'];
            }
            
            // Create upload directory
            $uploadDir = ROOT_PATH . '/public/uploads/receipts/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generate unique filename
            $extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
            $filename = $userId . '_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
            $filePath = $uploadDir . $filename;
            
            // Move uploaded file
            if (!move_uploaded_file($uploadedFile['tmp_name'], $filePath)) {
                return ['success' => false, 'message' => 'Failed to save uploaded file'];
            }
            
            return [
                'success' => true,
                'file_path' => 'uploads/receipts/' . $filename,
                'filename' => $filename
            ];
            
        } catch (\Exception $e) {
            error_log("File upload failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'File upload failed'];
        }
    }
    
    /**
     * Generate payment reference number
     */
    private static function generateReferenceNumber($type) {
        $prefix = strtoupper(substr($type, 0, 3));
        $timestamp = date('ymd');
        $random = str_pad(mt_rand(0, 9999), 4, '0', STR_PAD_LEFT);
        
        return "RA{$prefix}{$timestamp}{$random}";
    }
}