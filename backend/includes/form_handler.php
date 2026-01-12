<?php
/**
 * Secure Form Handler
 * Handles all form submissions with proper validation and security
 */

require_once __DIR__ . '/security.php';
require_once __DIR__ . '/error_handler.php';
require_once __DIR__ . '/secure_upload.php';

class FormHandler {
    
    /**
     * Handle exam submission with security validation
     */
    public static function handleExamSubmission($examId, $answers, $userId) {
        try {
            // Validate inputs
            $examId = SecurityManager::validateInput($examId, 'int');
            $userId = SecurityManager::validateInput($userId, 'int');
            
            if (!$examId || !$userId) {
                throw new Exception('Invalid exam or user ID');
            }
            
            // Check if exam exists and is active
            $exam = DB::fetchOne('SELECT * FROM exams WHERE id = ? AND status = "active"', [$examId]);
            if (!$exam) {
                throw new Exception('Exam not found or not active');
            }
            
            // Check if user already submitted
            $existing = DB::fetchOne('SELECT id FROM exam_submissions WHERE exam_id = ? AND user_id = ?', [$examId, $userId]);
            if ($existing) {
                throw new Exception('You have already submitted this exam');
            }
            
            // Validate answers
            $validatedAnswers = [];
            foreach ($answers as $questionId => $answer) {
                $questionId = SecurityManager::validateInput($questionId, 'int');
                $answer = SecurityManager::validateInput($answer, 'string');
                
                if ($questionId && $answer !== false) {
                    $validatedAnswers[$questionId] = $answer;
                }
            }
            
            // Calculate score (simplified)
            $totalQuestions = DB::fetchOne('SELECT COUNT(*) as count FROM exam_questions WHERE exam_id = ?', [$examId]);
            $score = (count($validatedAnswers) / $totalQuestions['count']) * 100;
            
            // Insert submission
            $submissionId = DB::insert(
                'INSERT INTO exam_submissions (exam_id, user_id, answers, score, submitted_at) VALUES (?, ?, ?, ?, NOW())',
                [$examId, $userId, json_encode($validatedAnswers), $score]
            );
            
            // Log submission
            ErrorHandler::logError('Exam submitted', [
                'exam_id' => $examId,
                'user_id' => $userId,
                'score' => $score,
                'submission_id' => $submissionId
            ]);
            
            return [
                'success' => true,
                'submission_id' => $submissionId,
                'score' => $score
            ];
            
        } catch (Exception $e) {
            ErrorHandler::logError('Exam submission failed: ' . $e->getMessage(), [
                'exam_id' => $examId ?? 'unknown',
                'user_id' => $userId ?? 'unknown'
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Handle payment upload with security validation
     */
    public static function handlePaymentUpload($userId, $file, $amount, $description) {
        try {
            // Validate inputs
            $userId = SecurityManager::validateInput($userId, 'int');
            $amount = SecurityManager::validateInput($amount, 'float');
            $description = SecurityManager::validateInput($description, 'string');
            
            if (!$userId || !$amount || !$description) {
                throw new Exception('Invalid payment information');
            }
            
            // Validate file upload
            $uploadHandler = new SecureFileUpload();
            $uploadResult = $uploadHandler->uploadFile($file, 'documents');
            
            if (!$uploadResult['success']) {
                throw new Exception('File upload failed: ' . implode(', ', $uploadResult['errors']));
            }
            
            // Insert payment record
            $paymentId = DB::insert(
                'INSERT INTO payments (user_id, amount, description, receipt_file, status, created_at) VALUES (?, ?, ?, ?, "pending", NOW())',
                [$userId, $amount, $description, $uploadResult['filename']]
            );
            
            // Log payment upload
            ErrorHandler::logError('Payment uploaded', [
                'user_id' => $userId,
                'amount' => $amount,
                'payment_id' => $paymentId,
                'filename' => $uploadResult['filename']
            ]);
            
            return [
                'success' => true,
                'payment_id' => $paymentId,
                'filename' => $uploadResult['filename']
            ];
            
        } catch (Exception $e) {
            ErrorHandler::logError('Payment upload failed: ' . $e->getMessage(), [
                'user_id' => $userId ?? 'unknown',
                'amount' => $amount ?? 'unknown'
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Handle contact form submission
     */
    public static function handleContactForm($name, $email, $subject, $message) {
        try {
            // Validate and sanitize inputs
            $name = SecurityManager::validateInput($name, 'name');
            $email = SecurityManager::validateInput($email, 'email');
            $subject = SecurityManager::validateInput($subject, 'string');
            $message = SecurityManager::validateInput($message, 'string');
            
            if (!$name || !$email || !$subject || !$message) {
                throw new Exception('All fields are required and must be valid');
            }
            
            // Check message length
            if (strlen($message) > 1000) {
                throw new Exception('Message is too long (maximum 1000 characters)');
            }
            
            // Insert contact message
            $contactId = DB::insert(
                'INSERT INTO contact_messages (name, email, subject, message, ip_address, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [$name, $email, $subject, $message, SecurityManager::getClientIP()]
            );
            
            // Log contact form submission
            ErrorHandler::logError('Contact form submitted', [
                'name' => $name,
                'email' => $email,
                'subject' => $subject,
                'contact_id' => $contactId
            ]);
            
            return [
                'success' => true,
                'contact_id' => $contactId
            ];
            
        } catch (Exception $e) {
            ErrorHandler::logError('Contact form submission failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>