<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Notification System Controller
 */
class NotificationController extends Controller {
    
    /**
     * Notification dashboard
     */
    public function dashboard() {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        $data = [
            'title' => 'Notifications - ' . APP_NAME,
            'user_role' => $userRole,
            'notifications' => $this->getUserNotifications($userId, $userRole),
            'unread_count' => $this->getUnreadCount($userId, $userRole)
        ];
        
        // Admin-specific data
        if (in_array($userRole, ['superadmin', 'admin'])) {
            $data['can_send'] = true;
            $data['associations'] = $this->getAssociations();
        }
        
        $this->render('notification.dashboard', $data);
    }
    
    /**
     * Send notification form
     */
    public function create() {
        $this->requireRole(['superadmin', 'admin']);
        
        $data = [
            'title' => 'Send Notification - ' . APP_NAME,
            'associations' => $this->getAssociations(),
            'notification_types' => [
                'general' => 'General Announcement',
                'exam' => 'Exam Related',
                'payment' => 'Payment Related',
                'camp' => 'Camp Related',
                'system' => 'System Update'
            ],
            'recipient_types' => [
                'all' => 'All Users',
                'ambassador' => 'All Ambassadors',
                'president' => 'All Association Presidents',
                'super_admin' => 'All Super Admins',
                'association' => 'Specific Association'
            ]
        ];
        
        $this->render('notification.create', $data);
    }
    
    /**
     * Store notification
     */
    public function store() {
        $this->requireRole(['superadmin', 'admin']);
        
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/notification/create');
        }
        
        $data = [
            'sender_id' => $_SESSION['user_id'],
            'title' => $this->sanitize($_POST['title'] ?? ''),
            'message' => $this->sanitize($_POST['message'] ?? ''),
            'type' => $_POST['type'] ?? 'general',
            'recipient_type' => $_POST['recipient_type'] ?? 'all',
            'recipient_id' => !empty($_POST['recipient_id']) ? (int)$_POST['recipient_id'] : null
        ];
        
        // Validate input
        if (empty($data['title']) || empty($data['message'])) {
            $this->setFlash('Please provide notification title and message.', 'error');
            $this->redirect('/notification/create');
        }
        
        // Validate recipient type
        if ($data['recipient_type'] === 'association' && !$data['recipient_id']) {
            $this->setFlash('Please select an association for association-specific notifications.', 'error');
            $this->redirect('/notification/create');
        }
        
        try {
            // For bulk notifications, we need to create individual notification records
            if ($data['recipient_type'] === 'all' || in_array($data['recipient_type'], ['ambassador', 'president', 'super_admin'])) {
                $recipients = $this->getRecipientsByType($data['recipient_type']);
                
                foreach ($recipients as $recipient) {
                    DB::insert("
                        INSERT INTO notifications (
                            sender_id, title, message, type, recipient_type, recipient_id, created_at
                        ) VALUES (?, ?, ?, ?, 'user', ?, NOW())
                    ", [
                        $data['sender_id'], $data['title'], $data['message'], 
                        $data['type'], $recipient['id']
                    ]);
                }
                
                $count = count($recipients);
                $this->setFlash("Notification sent to {$count} users successfully!", 'success');
                
            } else {
                // Single notification
                DB::insert("
                    INSERT INTO notifications (
                        sender_id, title, message, type, recipient_type, recipient_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, NOW())
                ", [
                    $data['sender_id'], $data['title'], $data['message'], 
                    $data['type'], $data['recipient_type'], $data['recipient_id']
                ]);
                
                $this->setFlash('Notification sent successfully!', 'success');
            }
            
            // Log notification sending
            log_security_event('notification_sent', 'Notification sent', $data['sender_id'], [
                'type' => $data['type'],
                'recipient_type' => $data['recipient_type'],
                'title' => $data['title']
            ]);
            
            $this->redirect('/notification/dashboard');
            
        } catch (Exception $e) {
            error_log("Notification creation error: " . $e->getMessage());
            $this->setFlash('Error sending notification. Please try again.', 'error');
            $this->redirect('/notification/create');
        }
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId) {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        try {
            // Update notification read status
            $updated = DB::execute("
                UPDATE notifications 
                SET is_read = 1 
                WHERE id = ? AND (
                    recipient_id = ? OR 
                    (recipient_type = ? AND recipient_id IS NULL) OR
                    recipient_type = 'all'
                )
            ", [$notificationId, $userId, $userRole]);
            
            if ($updated) {
                $this->jsonResponse(['success' => true, 'message' => 'Notification marked as read']);
            } else {
                $this->jsonResponse(['success' => false, 'message' => 'Notification not found']);
            }
            
        } catch (Exception $e) {
            error_log("Mark read error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error updating notification']);
        }
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead() {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        try {
            $updated = DB::execute("
                UPDATE notifications 
                SET is_read = 1 
                WHERE is_read = 0 AND (
                    recipient_id = ? OR 
                    (recipient_type = ? AND recipient_id IS NULL) OR
                    recipient_type = 'all'
                )
            ", [$userId, $userRole]);
            
            $this->jsonResponse([
                'success' => true, 
                'message' => "Marked {$updated} notifications as read"
            ]);
            
        } catch (Exception $e) {
            error_log("Mark all read error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error updating notifications']);
        }
    }
    
    /**
     * Delete notification
     */
    public function delete($notificationId) {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        if (!$this->validateCSRF()) {
            $this->jsonResponse(['success' => false, 'message' => 'Security error']);
        }
        
        try {
            $deleted = DB::execute("
                DELETE FROM notifications 
                WHERE id = ? AND (
                    recipient_id = ? OR 
                    (recipient_type = ? AND recipient_id IS NULL) OR
                    recipient_type = 'all'
                )
            ", [$notificationId, $userId, $userRole]);
            
            if ($deleted) {
                $this->jsonResponse(['success' => true, 'message' => 'Notification deleted']);
            } else {
                $this->jsonResponse(['success' => false, 'message' => 'Notification not found']);
            }
            
        } catch (Exception $e) {
            error_log("Delete notification error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error deleting notification']);
        }
    }
    
    /**
     * Get user notifications (API endpoint)
     */
    public function getNotifications() {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        $notifications = $this->getUserNotifications($userId, $userRole, 20);
        $unreadCount = $this->getUnreadCount($userId, $userRole);
        
        $this->jsonResponse([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    /**
     * Get user notifications
     */
    private function getUserNotifications($userId, $userRole, $limit = 50) {
        return DB::fetchAll("
            SELECT n.*, u.full_name as sender_name
            FROM notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            WHERE (
                n.recipient_id = ? OR 
                (n.recipient_type = ? AND n.recipient_id IS NULL) OR
                n.recipient_type = 'all'
            )
            ORDER BY n.created_at DESC
            LIMIT {$limit}
        ", [$userId, $userRole]);
    }
    
    /**
     * Get unread notification count
     */
    private function getUnreadCount($userId, $userRole) {
        $result = DB::fetchOne("
            SELECT COUNT(*) as count
            FROM notifications
            WHERE is_read = 0 AND (
                recipient_id = ? OR 
                (recipient_type = ? AND recipient_id IS NULL) OR
                recipient_type = 'all'
            )
        ", [$userId, $userRole]);
        
        return $result['count'] ?? 0;
    }
    
    /**
     * Get recipients by type
     */
    private function getRecipientsByType($type) {
        switch ($type) {
            case 'all':
                return DB::fetchAll("SELECT id FROM users WHERE status = 'active'");
                
            case 'ambassador':
                return DB::fetchAll("SELECT id FROM users WHERE role = 'ambassador' AND status = 'active'");
                
            case 'president':
                return DB::fetchAll("SELECT id FROM users WHERE role = 'president' AND status = 'active'");
                
            case 'super_admin':
                return DB::fetchAll("SELECT id FROM users WHERE role = 'super_admin' AND status = 'active'");
                
            default:
                return [];
        }
    }
    
    /**
     * Get all associations
     */
    private function getAssociations() {
        return DB::fetchAll("SELECT id, name FROM associations ORDER BY name");
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