<?php

namespace App\Controllers;

use App\Core\Controller;

/**
 * Exam System Controller - Complete Implementation
 */
class ExamController extends Controller {
    
    /**
     * Show exam dashboard based on user role
     */
    public function dashboard() {
        $userRole = $_SESSION['user_role'];
        $userId = $_SESSION['user_id'];
        
        $data = [
            'title' => 'Exam Dashboard - ' . APP_NAME,
            'user_role' => $userRole
        ];
        
        switch ($userRole) {
            case 'superadmin':
            case 'admin':
                $data['exams'] = $this->getAllExams();
                $data['pending_results'] = $this->getPendingResults();
                $data['statistics'] = $this->getExamStatistics();
                break;
                
            case 'president':
                $data['association_stats'] = $this->getAssociationExamStats($userId);
                $data['available_exams'] = $this->getAvailableExams();
                break;
                
            case 'ambassador':
            default:
                $data['available_exams'] = $this->getAvailableExams();
                $data['user_results'] = $this->getUserResults($userId);
                break;
        }
        
        $this->render('exam.dashboard', $data);
    }
    
    /**
     * Show exam taking interface
     */
    public function takeExam($examId) {
        $userId = $_SESSION['user_id'];
        
        // Check if user already took this exam
        $existingResult = DB::fetchOne(
            "SELECT * FROM exam_results WHERE user_id = ? AND exam_id = ?",
            [$userId, $examId]
        );
        
        if ($existingResult) {
            $this->setFlash('You have already taken this exam.', 'warning');
            $this->redirect('/exam/dashboard');
        }
        
        // Get exam details
        $exam = DB::fetchOne(
            "SELECT * FROM exams WHERE id = ? AND status = 'published'",
            [$examId]
        );
        
        if (!$exam) {
            $this->setFlash('Exam not found or not available.', 'error');
            $this->redirect('/exam/dashboard');
        }
        
        // Get randomized questions
        $questions = $this->getRandomizedQuestions($examId);
        
        if (empty($questions)) {
            $this->setFlash('No questions available for this exam.', 'error');
            $this->redirect('/exam/dashboard');
        }
        
        // Store exam session
        $_SESSION['exam_session'] = [
            'exam_id' => $examId,
            'start_time' => time(),
            'duration' => $exam['duration'] * 60, // Convert to seconds
            'questions' => array_column($questions, 'id')
        ];
        
        $data = [
            'title' => 'Taking Exam: ' . $exam['title'],
            'exam' => $exam,
            'questions' => $questions,
            'time_remaining' => $exam['duration'] * 60
        ];
        
        $this->render('exam.take', $data);
    }
    
    /**
     * Submit exam answers
     */
    public function submitExam() {
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/exam/dashboard');
        }
        
        $userId = $_SESSION['user_id'];
        $examSession = $_SESSION['exam_session'] ?? null;
        
        if (!$examSession) {
            $this->setFlash('Invalid exam session.', 'error');
            $this->redirect('/exam/dashboard');
        }
        
        $examId = $examSession['exam_id'];
        $startTime = $examSession['start_time'];
        $answers = $_POST['answers'] ?? [];
        
        // Calculate time taken
        $timeTaken = round((time() - $startTime) / 60); // Convert to minutes
        
        // Get exam details
        $exam = DB::fetchOne("SELECT * FROM exams WHERE id = ?", [$examId]);
        
        // Get correct answers
        $questions = DB::fetchAll(
            "SELECT id, correct_option, points FROM exam_questions WHERE exam_id = ?",
            [$examId]
        );
        
        // Calculate score
        $score = 0;
        $totalPoints = 0;
        $detailedAnswers = [];
        
        foreach ($questions as $question) {
            $totalPoints += $question['points'];
            $userAnswer = $answers[$question['id']] ?? null;
            $isCorrect = ($userAnswer === $question['correct_option']);
            
            if ($isCorrect) {
                $score += $question['points'];
            }
            
            $detailedAnswers[] = [
                'question_id' => $question['id'],
                'user_answer' => $userAnswer,
                'correct_answer' => $question['correct_option'],
                'is_correct' => $isCorrect,
                'points' => $isCorrect ? $question['points'] : 0
            ];
        }
        
        // Calculate percentage
        $percentage = $totalPoints > 0 ? round(($score / $totalPoints) * 100, 2) : 0;
        $status = $percentage >= $exam['pass_mark'] ? 'passed' : 'failed';
        
        try {
            // Save exam result
            $resultId = DB::insert("
                INSERT INTO exam_results (
                    exam_id, user_id, score, total_questions, percentage, 
                    status, time_taken, answers, taken_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ", [
                $examId, $userId, $score, count($questions), 
                $percentage, $status, $timeTaken, json_encode($detailedAnswers)
            ]);
            
            // Clear exam session
            unset($_SESSION['exam_session']);
            
            // Log exam completion
            log_security_event('exam_completed', 'User completed exam', $userId, [
                'exam_id' => $examId,
                'score' => $score,
                'percentage' => $percentage,
                'status' => $status
            ]);
            
            // Redirect to results
            $this->redirect("/exam/result/{$resultId}");
            
        } catch (Exception $e) {
            error_log("Exam submission error: " . $e->getMessage());
            $this->setFlash('Error submitting exam. Please try again.', 'error');
            $this->redirect('/exam/dashboard');
        }
    }
    
    /**
     * Show exam result
     */
    public function showResult($resultId) {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'];
        
        $whereClause = in_array($userRole, ['superadmin', 'admin']) 
            ? "r.id = ?" 
            : "r.id = ? AND r.user_id = ?";
        
        $params = in_array($userRole, ['superadmin', 'admin']) 
            ? [$resultId] 
            : [$resultId, $userId];
        
        $result = DB::fetchOne("
            SELECT r.*, e.title as exam_title, e.pass_mark, 
                   u.full_name, u.unique_id
            FROM exam_results r
            JOIN exams e ON r.exam_id = e.id
            JOIN users u ON r.user_id = u.id
            WHERE {$whereClause}
        ", $params);
        
        if (!$result) {
            $this->setFlash('Exam result not found.', 'error');
            $this->redirect('/exam/dashboard');
        }
        
        $data = [
            'title' => 'Exam Result - ' . $result['exam_title'],
            'result' => $result,
            'answers' => json_decode($result['answers'], true)
        ];
        
        $this->render('exam.result', $data);
    }
    
    /**
     * Create new exam (Admin only)
     */
    public function create() {
        $this->requireRole(['superadmin', 'admin']);
        
        $data = [
            'title' => 'Create New Exam - ' . APP_NAME
        ];
        
        $this->render('exam.create', $data);
    }
    
    /**
     * Store new exam
     */
    public function store() {
        $this->requireRole(['superadmin', 'admin']);
        
        if (!$this->validateCSRF()) {
            $this->setFlash('Security error. Please try again.', 'error');
            $this->redirect('/exam/create');
        }
        
        $data = [
            'title' => $this->sanitize($_POST['title'] ?? ''),
            'description' => $this->sanitize($_POST['description'] ?? ''),
            'duration' => (int)($_POST['duration'] ?? 60),
            'pass_mark' => (int)($_POST['pass_mark'] ?? 70),
            'status' => $_POST['status'] ?? 'draft',
            'created_by' => $_SESSION['user_id']
        ];
        
        // Validate input
        if (empty($data['title']) || $data['duration'] < 1) {
            $this->setFlash('Please provide valid exam title and duration.', 'error');
            $this->redirect('/exam/create');
        }
        
        try {
            $examId = DB::insert("
                INSERT INTO exams (title, description, duration, pass_mark, status, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ", [
                $data['title'], $data['description'], $data['duration'], 
                $data['pass_mark'], $data['status'], $data['created_by']
            ]);
            
            $this->setFlash('Exam created successfully!', 'success');
            $this->redirect("/exam/edit/{$examId}");
            
        } catch (Exception $e) {
            error_log("Exam creation error: " . $e->getMessage());
            $this->setFlash('Error creating exam. Please try again.', 'error');
            $this->redirect('/exam/create');
        }
    }
    
    /**
     * Add question to exam
     */
    public function addQuestion($examId) {
        $this->requireRole(['superadmin', 'admin']);
        
        if (!$this->validateCSRF()) {
            $this->jsonResponse(['success' => false, 'message' => 'Security error']);
        }
        
        $data = [
            'exam_id' => $examId,
            'question_text' => trim($_POST['question_text'] ?? ''),
            'option_a' => trim($_POST['option_a'] ?? ''),
            'option_b' => trim($_POST['option_b'] ?? ''),
            'option_c' => trim($_POST['option_c'] ?? ''),
            'option_d' => trim($_POST['option_d'] ?? ''),
            'correct_option' => $_POST['correct_option'] ?? '',
            'points' => (int)($_POST['points'] ?? 1)
        ];
        
        // Validate input
        if (empty($data['question_text']) || empty($data['option_a']) || 
            empty($data['option_b']) || !in_array($data['correct_option'], ['A', 'B', 'C', 'D'])) {
            $this->jsonResponse(['success' => false, 'message' => 'Please fill all required fields']);
        }
        
        try {
            $questionId = DB::insert("
                INSERT INTO exam_questions (
                    exam_id, question_text, option_a, option_b, option_c, option_d, 
                    correct_option, points
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ", [
                $data['exam_id'], $data['question_text'], $data['option_a'], 
                $data['option_b'], $data['option_c'], $data['option_d'], 
                $data['correct_option'], $data['points']
            ]);
            
            // Update exam total questions count
            DB::execute("
                UPDATE exams SET total_questions = (
                    SELECT COUNT(*) FROM exam_questions WHERE exam_id = ?
                ) WHERE id = ?
            ", [$examId, $examId]);
            
            $this->jsonResponse([
                'success' => true, 
                'message' => 'Question added successfully',
                'question_id' => $questionId
            ]);
            
        } catch (Exception $e) {
            error_log("Question creation error: " . $e->getMessage());
            $this->jsonResponse(['success' => false, 'message' => 'Error adding question']);
        }
    }
    
    /**
     * Get randomized questions for exam
     */
    private function getRandomizedQuestions($examId) {
        return DB::fetchAll("
            SELECT id, question_text, option_a, option_b, option_c, option_d, points
            FROM exam_questions 
            WHERE exam_id = ? 
            ORDER BY RAND()
        ", [$examId]);
    }
    
    /**
     * Get all exams (Admin view)
     */
    private function getAllExams() {
        return DB::fetchAll("
            SELECT e.*, u.full_name as created_by_name,
                   COUNT(r.id) as total_attempts,
                   AVG(r.percentage) as avg_score
            FROM exams e
            LEFT JOIN users u ON e.created_by = u.id
            LEFT JOIN exam_results r ON e.id = r.exam_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        ");
    }
    
    /**
     * Get available exams for users
     */
    private function getAvailableExams() {
        return DB::fetchAll("
            SELECT * FROM exams 
            WHERE status = 'published' 
            ORDER BY created_at DESC
        ");
    }
    
    /**
     * Get user exam results
     */
    private function getUserResults($userId) {
        return DB::fetchAll("
            SELECT r.*, e.title as exam_title
            FROM exam_results r
            JOIN exams e ON r.exam_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.taken_at DESC
        ", [$userId]);
    }
    
    /**
     * Get pending results for approval
     */
    private function getPendingResults() {
        return DB::fetchAll("
            SELECT r.*, e.title as exam_title, u.full_name, u.unique_id
            FROM exam_results r
            JOIN exams e ON r.exam_id = e.id
            JOIN users u ON r.user_id = u.id
            WHERE r.approved_by IS NULL
            ORDER BY r.taken_at ASC
        ");
    }
    
    /**
     * Get exam statistics
     */
    private function getExamStatistics() {
        return [
            'total_exams' => DB::fetchOne("SELECT COUNT(*) as count FROM exams")['count'],
            'published_exams' => DB::fetchOne("SELECT COUNT(*) as count FROM exams WHERE status = 'published'")['count'],
            'total_attempts' => DB::fetchOne("SELECT COUNT(*) as count FROM exam_results")['count'],
            'avg_pass_rate' => DB::fetchOne("SELECT AVG(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) * 100 as rate FROM exam_results")['rate'] ?? 0
        ];
    }
    
    /**
     * Get association exam statistics
     */
    private function getAssociationExamStats($userId) {
        $user = DB::fetchOne("SELECT association_id FROM users WHERE id = ?", [$userId]);
        
        if (!$user || !$user['association_id']) {
            return [];
        }
        
        return DB::fetchAll("
            SELECT e.title, COUNT(r.id) as attempts, 
                   AVG(r.percentage) as avg_score,
                   SUM(CASE WHEN r.status = 'passed' THEN 1 ELSE 0 END) as passed
            FROM exams e
            LEFT JOIN exam_results r ON e.id = r.exam_id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE u.association_id = ? OR r.id IS NULL
            GROUP BY e.id
            ORDER BY e.created_at DESC
        ", [$user['association_id']]);
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