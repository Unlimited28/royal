<?php

namespace App\Services;

use App\Core\DB;

/**
 * Email Service for sending notifications
 */
class EmailService {
    
    private static $fromEmail = 'noreply@royalambassadors.org';
    private static $fromName = 'Royal Ambassadors OGBC';
    
    /**
     * Queue an email for sending
     */
    public static function queue($to, $subject, $body, $template = null, $templateData = [], $priority = 'normal') {
        try {
            return DB::insert(
                "INSERT INTO email_queue (recipient_email, recipient_name, subject, body, template, template_data, priority) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $to,
                    $templateData['name'] ?? '',
                    $subject,
                    $body,
                    $template,
                    json_encode($templateData),
                    $priority
                ]
            );
        } catch (\Exception $e) {
            error_log("Failed to queue email: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send password reset email
     */
    public static function sendPasswordReset($email, $name, $resetToken) {
        $resetUrl = BASE_URL . "/public/reset-password.php?token=" . urlencode($resetToken);
        
        $subject = "Password Reset Request - Royal Ambassadors OGBC";
        $body = self::getTemplate('password_reset', [
            'name' => $name,
            'reset_url' => $resetUrl,
            'expires_in' => '1 hour'
        ]);
        
        return self::queue($email, $subject, $body, 'password_reset', [
            'name' => $name,
            'reset_url' => $resetUrl
        ], 'high');
    }
    
    /**
     * Send email verification
     */
    public static function sendEmailVerification($email, $name, $verificationToken) {
        $verifyUrl = BASE_URL . "/public/verify-email.php?token=" . urlencode($verificationToken);
        
        $subject = "Verify Your Email - Royal Ambassadors OGBC";
        $body = self::getTemplate('email_verification', [
            'name' => $name,
            'verify_url' => $verifyUrl
        ]);
        
        return self::queue($email, $subject, $body, 'email_verification', [
            'name' => $name,
            'verify_url' => $verifyUrl
        ], 'high');
    }
    
    /**
     * Send exam reminder
     */
    public static function sendExamReminder($email, $name, $examTitle, $examDate) {
        $subject = "Exam Reminder: $examTitle - Royal Ambassadors OGBC";
        $body = self::getTemplate('exam_reminder', [
            'name' => $name,
            'exam_title' => $examTitle,
            'exam_date' => $examDate,
            'portal_url' => BASE_URL . '/ambassador/my_exams.php'
        ]);
        
        return self::queue($email, $subject, $body, 'exam_reminder', [
            'name' => $name,
            'exam_title' => $examTitle,
            'exam_date' => $examDate
        ]);
    }
    
    /**
     * Send payment confirmation
     */
    public static function sendPaymentConfirmation($email, $name, $paymentType, $amount, $status) {
        $subject = "Payment " . ucfirst($status) . " - Royal Ambassadors OGBC";
        $body = self::getTemplate('payment_confirmation', [
            'name' => $name,
            'payment_type' => $paymentType,
            'amount' => $amount,
            'status' => $status,
            'portal_url' => BASE_URL . '/association-president/payments_upload.php'
        ]);
        
        return self::queue($email, $subject, $body, 'payment_confirmation', [
            'name' => $name,
            'payment_type' => $paymentType,
            'amount' => $amount,
            'status' => $status
        ]);
    }
    
    /**
     * Send rank promotion notification
     */
    public static function sendRankPromotion($email, $name, $newRank, $examTitle) {
        $subject = "Congratulations! Rank Promotion - Royal Ambassadors OGBC";
        $body = self::getTemplate('rank_promotion', [
            'name' => $name,
            'new_rank' => $newRank,
            'exam_title' => $examTitle,
            'portal_url' => BASE_URL . '/ambassador/dashboard.php'
        ]);
        
        return self::queue($email, $subject, $body, 'rank_promotion', [
            'name' => $name,
            'new_rank' => $newRank,
            'exam_title' => $examTitle
        ], 'high');
    }
    
    /**
     * Process email queue (to be called by cron job)
     */
    public static function processQueue($limit = 10) {
        try {
            $emails = DB::fetchAll(
                "SELECT * FROM email_queue 
                 WHERE status = 'pending' AND attempts < max_attempts 
                 AND scheduled_at <= NOW() 
                 ORDER BY priority DESC, created_at ASC 
                 LIMIT ?",
                [$limit]
            );
            
            foreach ($emails as $email) {
                $success = self::sendEmail($email);
                
                if ($success) {
                    DB::execute(
                        "UPDATE email_queue SET status = 'sent', sent_at = NOW() WHERE id = ?",
                        [$email['id']]
                    );
                } else {
                    DB::execute(
                        "UPDATE email_queue SET attempts = attempts + 1, error_message = ? WHERE id = ?",
                        ['Failed to send email', $email['id']]
                    );
                    
                    // Mark as failed if max attempts reached
                    if ($email['attempts'] + 1 >= $email['max_attempts']) {
                        DB::execute(
                            "UPDATE email_queue SET status = 'failed' WHERE id = ?",
                            [$email['id']]
                        );
                    }
                }
            }
            
            return count($emails);
        } catch (\Exception $e) {
            error_log("Email queue processing failed: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Actually send the email (using PHP mail or SMTP)
     */
    private static function sendEmail($emailData) {
        try {
            $headers = [
                'From: ' . self::$fromName . ' <' . self::$fromEmail . '>',
                'Reply-To: ' . self::$fromEmail,
                'Content-Type: text/html; charset=UTF-8',
                'MIME-Version: 1.0'
            ];
            
            return mail(
                $emailData['recipient_email'],
                $emailData['subject'],
                $emailData['body'],
                implode("\r\n", $headers)
            );
        } catch (\Exception $e) {
            error_log("Failed to send email: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get email template
     */
    private static function getTemplate($template, $data) {
        $templates = [
            'password_reset' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">Password Reset Request</h2>
                    <p>Hello {name},</p>
                    <p>You have requested to reset your password for your Royal Ambassadors OGBC account.</p>
                    <p>Click the button below to reset your password:</p>
                    <a href="{reset_url}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                    <p>This link will expire in {expires_in}.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                    <p>Best regards,<br>Royal Ambassadors OGBC Team</p>
                </div>
            ',
            'email_verification' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">Verify Your Email Address</h2>
                    <p>Hello {name},</p>
                    <p>Thank you for registering with Royal Ambassadors OGBC!</p>
                    <p>Please click the button below to verify your email address:</p>
                    <a href="{verify_url}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
                    <p>If you did not create this account, please ignore this email.</p>
                    <p>Best regards,<br>Royal Ambassadors OGBC Team</p>
                </div>
            ',
            'exam_reminder' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">Exam Reminder</h2>
                    <p>Hello {name},</p>
                    <p>This is a reminder that you have an upcoming exam:</p>
                    <div style="background-color: #f7fafc; padding: 16px; border-radius: 4px; margin: 16px 0;">
                        <h3 style="margin: 0; color: #2d3748;">{exam_title}</h3>
                        <p style="margin: 8px 0 0 0;">Date: {exam_date}</p>
                    </div>
                    <p>Please make sure you are prepared and log in to your portal on time.</p>
                    <a href="{portal_url}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Portal</a>
                    <p>Best regards,<br>Royal Ambassadors OGBC Team</p>
                </div>
            ',
            'payment_confirmation' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">Payment {status}</h2>
                    <p>Hello {name},</p>
                    <p>Your payment has been {status}:</p>
                    <div style="background-color: #f7fafc; padding: 16px; border-radius: 4px; margin: 16px 0;">
                        <p><strong>Payment Type:</strong> {payment_type}</p>
                        <p><strong>Amount:</strong> ₦{amount}</p>
                        <p><strong>Status:</strong> {status}</p>
                    </div>
                    <a href="{portal_url}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a>
                    <p>Best regards,<br>Royal Ambassadors OGBC Team</p>
                </div>
            ',
            'rank_promotion' => '
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #38a169;">🎉 Congratulations on Your Promotion!</h2>
                    <p>Hello {name},</p>
                    <p>We are excited to inform you that you have been promoted to a new rank!</p>
                    <div style="background-color: #f0fff4; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 4px solid #38a169;">
                        <h3 style="margin: 0; color: #2f855a;">New Rank: {new_rank}</h3>
                        <p style="margin: 8px 0 0 0;">Based on your performance in: {exam_title}</p>
                    </div>
                    <p>Keep up the excellent work and continue your journey with Royal Ambassadors OGBC!</p>
                    <a href="{portal_url}" style="background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Dashboard</a>
                    <p>Best regards,<br>Royal Ambassadors OGBC Team</p>
                </div>
            '
        ];
        
        $template = $templates[$template] ?? '';
        
        foreach ($data as $key => $value) {
            $template = str_replace('{' . $key . '}', $value, $template);
        }
        
        return $template;
    }
}