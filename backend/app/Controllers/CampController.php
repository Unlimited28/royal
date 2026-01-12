<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Camp Registration Controller - Excel Upload System
 */
class CampController extends Controller {
    
    private $uploadDir = 'uploads/camp_files/';
    private $allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    private $maxFileSize = 10 * 1024 * 1024; // 10MB
    
    /**
     * Camp dashboard
     */
    public function dashboard() {
        $userRole = $_SESSION['user_role'];
        $userId = $_SESSION['user_id'];
        
        $data = [
            'title' => 'Camp Registration - ' . APP_NAME,
            'user_role' => $userRole
        ];
        
        switch ($userRole) {
            case 'superadmin':
                $data['all_registrations'] = $this->getAllRegistrations();
                $data['pending_registrations'] = $this->getPendingRegistrations();
                $data['statistics'] = $this->getCampStatistics();
                break;
                
            case 'president':
                $data['association_registrations'] = $this->getAssociationRegistrations($userId);
                $data['can_upload'] = true;
                break;
                
            case 'ambassador':
            default:
                $data['association_registrations'] = $this->getAssociationRegistrations($userId);
                $data['can_upload'] = false;
                break;
        }
        
        $this->render('camp.dashboard', $data);
    }
    
    /**
     * Show upload form (Association Presidents only)
     */
    public function upload() {
        $this->requireRole(['president']);
        
        $userId = $_SESSION['user_id'];
        $user = DB::fetchOne("SELECT association_id FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !$user['association_id']) {
            $this->setFlash('You must be assigned to an association to upload camp registrations.', 'error');
            $this->redirect('/camp/dashboard');
        }
        
        $data = [
            'title' => 'Upload Camp Registration - ' . APP_NAME,
            'current_year' => date('Y'),
            'available_years' => range(date('Y'), date('Y') + 2)
        ];
        
        $this->render('camp.upload', $data);
    }
    
    /**
     * Process camp registration upload
     */
    public function store() {
        $this->requireRole(['president']);
        
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/camp/upload');
        }
        
        $userId = $_SESSION['user_id'];
        $user = DB::fetchOne("SELECT association_id FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !$user['association_id']) {
            $this->setFlash('You must be assigned to an association.', 'error');
            $this->redirect('/camp/upload');
        }
        
        $data = [
            'association_id' => $user['association_id'],
            'camp_year' => (int)($_POST['camp_year'] ?? date('Y')),
            'uploaded_by' => $userId
        ];
        
        // Validate camp year
        if ($data['camp_year'] < date('Y') || $data['camp_year'] > (date('Y') + 2)) {
            $this->setFlash('Invalid camp year selected.', 'error');
            $this->redirect('/camp/upload');
        }
        
        // Check if registration already exists for this year
        $existing = DB::fetchOne("
            SELECT id FROM camp_registrations 
            WHERE association_id = ? AND camp_year = ?
        ", [$data['association_id'], $data['camp_year']]);
        
        if ($existing) {
            $this->setFlash('Camp registration for this year already exists. Please contact administrator to update.', 'error');
            $this->redirect('/camp/upload');
        }
        
        // Handle file upload
        if (!isset($_FILES['camp_file']) || $_FILES['camp_file']['error'] !== UPLOAD_ERR_OK) {
            $this->setFlash('Please upload a valid Excel/CSV file.', 'error');
            $this->redirect('/camp/upload');
        }
        
        $uploadResult = $this->handleFileUpload($_FILES['camp_file']);
        
        if (!$uploadResult['success']) {
            $this->setFlash($uploadResult['message'], 'error');
            $this->redirect('/camp/upload');
        }
        
        $data['file_path'] = $uploadResult['file_path'];
        
        // Parse Excel/CSV file to count participants
        $participantCount = $this->parseParticipantCount($data['file_path']);
        $data['total_participants'] = $participantCount;
        
        try {
            $registrationId = DB::insert("
                INSERT INTO camp_registrations (
                    association_id, camp_year, file_path, total_participants, 
                    status, uploaded_by, uploaded_at
                ) VALUES (?, ?, ?, ?, 'pending', ?, NOW())
            ", [
                $data['association_id'], $data['camp_year'], $data['file_path'], 
                $data['total_participants'], $data['uploaded_by']
            ]);
            
            // Send notification to super admin
            $this->notifyCampUpload($registrationId, $data);
            
            // Log camp registration upload
            log_security_event('camp_registration_uploaded', 'Camp registration file uploaded', $userId, [
                'registration_id' => $registrationId,
                'camp_year' => $data['camp_year'],
                'participants' => $data['total_participants']
            ]);
            
            $this->setFlash("Camp registration uploaded successfully! Total participants: {$data['total_participants']}", 'success');
            $this->redirect('/camp/dashboard');
            
        } catch (Exception $e) {
            // Delete uploaded file if database insert fails
            if (file_exists($data['file_path'])) {
                unlink($data['file_path']);
            }
            
            error_log("Camp registration upload error: " . $e->getMessage());
            $this->setFlash('Error uploading camp registration. Please try again.', 'error');
            $this->redirect('/camp/upload');
        }
    }
    
    /**
     * Review camp registration (Super Admin only)
     */
    public function review($registrationId) {
        $this->requireRole(['superadmin']);
        
        $registration = DB::fetchOne("
            SELECT cr.*, a.name as association_name, u.full_name as uploaded_by_name
            FROM camp_registrations cr
            JOIN associations a ON cr.association_id = a.id
            JOIN users u ON cr.uploaded_by = u.id
            WHERE cr.id = ?
        ", [$registrationId]);
        
        if (!$registration) {
            $this->setFlash('Camp registration not found.', 'error');
            $this->redirect('/camp/dashboard');
        }
        
        // Parse file data for preview
        $participants = $this->parseExcelFile($registration['file_path']);
        
        $data = [
            'title' => 'Review Camp Registration - ' . $registration['association_name'],
            'registration' => $registration,
            'participants' => $participants,
            'preview_limit' => 20 // Show first 20 participants for preview
        ];
        
        $this->render('camp.review', $data);
    }
    
    /**
     * Approve/Reject camp registration
     */
    public function processReview($registrationId) {
        $this->requireRole(['superadmin']);
        
        if (!$this->validateCSRF()) {
            $this->jsonResponse(['success' => false, 'message' => 'Security error']);
        }
        
        $action = $_POST['action'] ?? '';
        $notes = $this->sanitize($_POST['notes'] ?? '');
        $reviewedBy = $_SESSION['user_id'];
        
        if (!in_array($action, ['approve', 'reject'])) {
            $this->jsonResponse(['success' => false, 'message' => 'Invalid action']);
        }
        
        $status = ($action === 'approve') ? 'approved' : 'rejected';
        
        try {
            $updated = DB::execute("
                UPDATE camp_registrations 
                SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ?
                WHERE id = ?
            ", [$status, $reviewedBy, $notes, $registrationId]);
            
            if ($updated) {
                // Get registration details for notification
                $registration = DB::fetchOne("
                    SELECT cr.*, a.name as association_name, u.full_name, u.email 
                    FROM camp_registrations cr
                    JOIN associations a ON cr.association_id = a.id
                    JOIN users u ON cr.uploaded_by = u.id
                    WHERE cr.id = ?
                ", [$registrationId]);
                
                // Send notification to uploader
                $this->notifyCampReview($registration, $status, $notes);
                
                // Log review
                log_security_event('camp_registration_reviewed', "Camp registration {$status}", $reviewedBy, [
                    'registration_id' => $registrationId,
                    'status' => $status,
                    'association' => $registration['association_name']
                ]);
                
                $this->jsonResponse([
                    'success' => true, 
                    'message' => "Camp registration {$status} successfully"
                ]);
            } else {
                $this->jsonResponse(['success' => false, 'message' => 'Registration not found']);
            }
            
        } catch (Exception $e) {
            error_log("Camp review error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error processing review']);
        }
    }
    
    /**
     * Download camp registration file
     */
    public function download($registrationId) {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        // Check permissions
        $whereClause = "cr.id = ?";
        $params = [$registrationId];
        
        if (!in_array($userRole, ['superadmin'])) {
            $whereClause .= " AND cr.uploaded_by = ?";
            $params[] = $userId;
        }
        
        $registration = DB::fetchOne("
            SELECT cr.*, a.name as association_name
            FROM camp_registrations cr
            JOIN associations a ON cr.association_id = a.id
            WHERE {$whereClause}
        ", $params);
        
        if (!$registration || !file_exists($registration['file_path'])) {
            $this->setFlash('File not found.', 'error');
            $this->redirect('/camp/dashboard');
        }
        
        // Force download
        $filename = $registration['association_name'] . '_Camp_' . $registration['camp_year'] . '_Registration.xlsx';
        
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . filesize($registration['file_path']));
        
        readfile($registration['file_path']);
        exit;
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
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $this->allowedTypes)) {
            return [
                'success' => false,
                'message' => 'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.'
            ];
        }
        
        // Validate file size
        if ($file['size'] > $this->maxFileSize) {
            return [
                'success' => false,
                'message' => 'File too large. Maximum size is 10MB.'
            ];
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'camp_' . date('Y') . '_' . uniqid() . '.' . $extension;
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
     * Parse participant count from Excel/CSV file
     */
    private function parseParticipantCount($filePath) {
        try {
            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            
            if (in_array($extension, ['xlsx', 'xls'])) {
                // For Excel files, we'll do a simple row count
                // In a real implementation, you'd use PhpSpreadsheet library
                return $this->countExcelRows($filePath);
            } else {
                // For CSV files
                return $this->countCsvRows($filePath);
            }
        } catch (Exception $e) {
            error_log("Error parsing participant count: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Count rows in CSV file
     */
    private function countCsvRows($filePath) {
        $count = 0;
        if (($handle = fopen($filePath, "r")) !== FALSE) {
            // Skip header row
            fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (!empty(array_filter($data))) { // Skip empty rows
                    $count++;
                }
            }
            fclose($handle);
        }
        return $count;
    }
    
    /**
     * Count rows in Excel file (simplified)
     */
    private function countExcelRows($filePath) {
        // This is a simplified implementation
        // In production, you should use PhpSpreadsheet library
        // For now, we'll return a default estimate
        return 50; // Placeholder
    }
    
    /**
     * Parse Excel file for preview (simplified)
     */
    private function parseExcelFile($filePath) {
        // Simplified implementation - in production use PhpSpreadsheet
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        if ($extension === 'csv') {
            return $this->parseCsvFile($filePath);
        }
        
        // For Excel files, return sample data
        return [
            ['Name', 'Age', 'Church', 'Phone', 'Emergency Contact'],
            ['John Doe', '25', 'Grace Chapel', '08012345678', 'Jane Doe - 08087654321'],
            ['Mary Smith', '22', 'Faith Church', '08023456789', 'Paul Smith - 08098765432']
        ];
    }
    
    /**
     * Parse CSV file
     */
    private function parseCsvFile($filePath) {
        $data = [];
        if (($handle = fopen($filePath, "r")) !== FALSE) {
            while (($row = fgetcsv($handle)) !== FALSE) {
                $data[] = $row;
            }
            fclose($handle);
        }
        return $data;
    }
    
    /**
     * Get all registrations (Super Admin)
     */
    private function getAllRegistrations() {
        return DB::fetchAll("
            SELECT cr.*, a.name as association_name, u.full_name as uploaded_by_name,
                   r.full_name as reviewed_by_name
            FROM camp_registrations cr
            JOIN associations a ON cr.association_id = a.id
            JOIN users u ON cr.uploaded_by = u.id
            LEFT JOIN users r ON cr.reviewed_by = r.id
            ORDER BY cr.uploaded_at DESC
        ");
    }
    
    /**
     * Get pending registrations
     */
    private function getPendingRegistrations() {
        return DB::fetchAll("
            SELECT cr.*, a.name as association_name, u.full_name as uploaded_by_name
            FROM camp_registrations cr
            JOIN associations a ON cr.association_id = a.id
            JOIN users u ON cr.uploaded_by = u.id
            WHERE cr.status = 'pending'
            ORDER BY cr.uploaded_at ASC
        ");
    }
    
    /**
     * Get association registrations
     */
    private function getAssociationRegistrations($userId) {
        $user = DB::fetchOne("SELECT association_id FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !$user['association_id']) {
            return [];
        }
        
        return DB::fetchAll("
            SELECT cr.*, a.name as association_name, u.full_name as uploaded_by_name,
                   r.full_name as reviewed_by_name
            FROM camp_registrations cr
            JOIN associations a ON cr.association_id = a.id
            JOIN users u ON cr.uploaded_by = u.id
            LEFT JOIN users r ON cr.reviewed_by = r.id
            WHERE cr.association_id = ?
            ORDER BY cr.uploaded_at DESC
        ", [$user['association_id']]);
    }
    
    /**
     * Get camp statistics
     */
    private function getCampStatistics() {
        return [
            'total_registrations' => DB::fetchOne("SELECT COUNT(*) as count FROM camp_registrations")['count'],
            'pending_registrations' => DB::fetchOne("SELECT COUNT(*) as count FROM camp_registrations WHERE status = 'pending'")['count'],
            'approved_registrations' => DB::fetchOne("SELECT COUNT(*) as count FROM camp_registrations WHERE status = 'approved'")['count'],
            'total_participants' => DB::fetchOne("SELECT SUM(total_participants) as total FROM camp_registrations WHERE status = 'approved'")['total'] ?? 0,
            'current_year_participants' => DB::fetchOne("SELECT SUM(total_participants) as total FROM camp_registrations WHERE status = 'approved' AND camp_year = ?", [date('Y')])['total'] ?? 0
        ];
    }
    
    /**
     * Send notification for camp upload
     */
    private function notifyCampUpload($registrationId, $data) {
        $association = DB::fetchOne("SELECT name FROM associations WHERE id = ?", [$data['association_id']]);
        
        $title = "New Camp Registration Uploaded";
        $message = "Camp registration uploaded by {$association['name']} for {$data['camp_year']} - Participants: {$data['total_participants']}";
        
        // Notify all super admins
        $this->sendNotification($title, $message, 'camp', 'super_admin', null, $data['uploaded_by']);
    }
    
    /**
     * Send notification for camp review
     */
    private function notifyCampReview($registration, $status, $notes) {
        $title = "Camp Registration " . ucfirst($status);
        $message = "Your camp registration for {$registration['camp_year']} has been {$status}.";
        
        if (!empty($notes)) {
            $message .= " Notes: {$notes}";
        }
        
        $this->sendNotification($title, $message, 'camp', 'user', $registration['uploaded_by'], $_SESSION['user_id']);
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