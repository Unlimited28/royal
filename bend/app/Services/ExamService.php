<?php

namespace App\Services;

use App\Core\DB;

/**
 * Exam Service for managing exam sessions and auto-submission
 */
class ExamService {
    
    /**
     * Start exam session
     */
    public static function startExamSession($userId, $examId) {
        try {
            // Check if user already has an active session for this exam
            $existingSession = DB::fetchOne(
                "SELECT * FROM exam_sessions WHERE user_id = ? AND exam_id = ? AND status = 'active'",
                [$userId, $examId]
            );
            
            if ($existingSession) {
                return [
                    'success' => true,
                    'session_token' => $existingSession['session_token'],
                    'time_remaining' => $existingSession['time_remaining'],
                    'start_time' => $existingSession['start_time']
                ];
            }
            
            // Get exam details
            $exam = DB::fetchOne("SELECT * FROM exams WHERE id = ? AND status = 'published'", [$examId]);
            if (!$exam) {
                return ['success' => false, 'message' => 'Exam not found or not available'];
            }
            
            // Check if user already completed this exam
            $existingResult = DB::fetchOne(
                "SELECT * FROM exam_results WHERE user_id = ? AND exam_id = ?",
                [$userId, $examId]
            );
            
            if ($existingResult) {
                return ['success' => false, 'message' => 'You have already completed this exam'];
            }
            
            // Create new session
            $sessionToken = bin2hex(random_bytes(32));
            $durationMinutes = $exam['duration'];
            
            $sessionId = DB::insert(
                "INSERT INTO exam_sessions (user_id, exam_id, session_token, duration_minutes, time_remaining) 
                 VALUES (?, ?, ?, ?, ?)",
                [$userId, $examId, $sessionToken, $durationMinutes, $durationMinutes * 60]
            );
            
            return [
                'success' => true,
                'session_token' => $sessionToken,
                'time_remaining' => $durationMinutes * 60,
                'start_time' => date('Y-m-d H:i:s')
            ];
            
        } catch (\Exception $e) {
            error_log("Failed to start exam session: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to start exam session'];
        }
    }
    
    /**
     * Update exam session (save progress)
     */
    public static function updateSession($sessionToken, $answers, $timeRemaining) {
        try {
            $session = DB::fetchOne(
                "SELECT * FROM exam_sessions WHERE session_token = ? AND status = 'active'",
                [$sessionToken]
            );
            
            if (!$session) {
                return ['success' => false, 'message' => 'Invalid session'];
            }
            
            // Check if session has expired
            $startTime = strtotime($session['start_time']);
            $maxDuration = $session['duration_minutes'] * 60;
            $elapsed = time() - $startTime;
            
            if ($elapsed >= $maxDuration || $timeRemaining <= 0) {
                // Auto-submit if time expired
                return self::submitExam($sessionToken, $answers, true);
            }
            
            // Update session
            DB::execute(
                "UPDATE exam_sessions SET answers = ?, time_remaining = ?, updated_at = NOW() WHERE session_token = ?",
                [json_encode($answers), $timeRemaining, $sessionToken]
            );
            
            return ['success' => true, 'time_remaining' => $timeRemaining];
            
        } catch (\Exception $e) {
            error_log("Failed to update exam session: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to update session'];
        }
    }
    
    /**
     * Submit exam
     */
    public static function submitExam($sessionToken, $answers, $autoSubmit = false) {
        try {
            DB::beginTransaction();
            
            // Get session details
            $session = DB::fetchOne(
                "SELECT es.*, e.pass_mark, e.title as exam_title 
                 FROM exam_sessions es 
                 JOIN exams e ON es.exam_id = e.id 
                 WHERE es.session_token = ? AND es.status = 'active'",
                [$sessionToken]
            );
            
            if (!$session) {
                DB::rollback();
                return ['success' => false, 'message' => 'Invalid session'];
            }
            
            // Get exam questions
            $questions = DB::fetchAll(
                "SELECT id, correct_option, points FROM exam_questions WHERE exam_id = ?",
                [$session['exam_id']]
            );
            
            // Calculate score
            $score = 0;
            $totalQuestions = count($questions);
            $correctAnswers = 0;
            
            foreach ($questions as $question) {
                $userAnswer = $answers[$question['id']] ?? null;
                if ($userAnswer && $userAnswer === $question['correct_option']) {
                    $score += $question['points'];
                    $correctAnswers++;
                }
            }
            
            $percentage = $totalQuestions > 0 ? ($correctAnswers / $totalQuestions) * 100 : 0;
            $status = $percentage >= $session['pass_mark'] ? 'passed' : 'failed';
            
            // Calculate time taken
            $startTime = strtotime($session['start_time']);
            $timeTaken = (time() - $startTime) / 60; // in minutes
            
            // Insert exam result
            $resultId = DB::insert(
                "INSERT INTO exam_results (exam_id, user_id, score, total_questions, percentage, status, time_taken, answers, taken_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                [
                    $session['exam_id'],
                    $session['user_id'],
                    $score,
                    $totalQuestions,
                    $percentage,
                    $status,
                    $timeTaken,
                    json_encode($answers)
                ]
            );
            
            // Update session status
            DB::execute(
                "UPDATE exam_sessions SET status = 'completed', end_time = NOW() WHERE session_token = ?",
                [$sessionToken]
            );
            
            // Check for rank progression if exam passed
            if ($status === 'passed') {
                self::checkRankProgression($session['user_id'], $resultId, $session['exam_id']);
            }
            
            DB::commit();
            
            return [
                'success' => true,
                'score' => $score,
                'total_questions' => $totalQuestions,
                'percentage' => $percentage,
                'status' => $status,
                'auto_submit' => $autoSubmit
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            error_log("Failed to submit exam: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to submit exam'];
        }
    }
    
    /**
     * Check and process rank progression
     */
    private static function checkRankProgression($userId, $examResultId, $examId) {
        try {
            // Get user's current rank
            $user = DB::fetchOne("SELECT rank_id, full_name, email FROM users WHERE id = ?", [$userId]);
            if (!$user || !$user['rank_id']) {
                return;
            }
            
            $currentRankLevel = DB::fetchOne("SELECT level FROM ranks WHERE id = ?", [$user['rank_id']]);
            if (!$currentRankLevel) {
                return;
            }
            
            // Get next rank
            $nextRank = DB::fetchOne(
                "SELECT id, name FROM ranks WHERE level = ? ORDER BY level ASC LIMIT 1",
                [$currentRankLevel['level'] + 1]
            );
            
            if (!$nextRank) {
                return; // Already at highest rank
            }
            
            // Check if this exam qualifies for promotion
            $examTitle = DB::fetchOne("SELECT title FROM exams WHERE id = ?", [$examId]);
            
            // Promote user
            DB::execute("UPDATE users SET rank_id = ? WHERE id = ?", [$nextRank['id'], $userId]);
            
            // Record progression
            DB::insert(
                "INSERT INTO rank_progressions (user_id, from_rank_id, to_rank_id, exam_result_id, reason) 
                 VALUES (?, ?, ?, ?, 'exam_passed')",
                [$userId, $user['rank_id'], $nextRank['id'], $examResultId]
            );
            
            // Send promotion email
            EmailService::sendRankPromotion(
                $user['email'],
                $user['full_name'],
                $nextRank['name'],
                $examTitle['title'] ?? 'Unknown Exam'
            );
            
        } catch (\Exception $e) {
            error_log("Failed to process rank progression: " . $e->getMessage());
        }
    }
    
    /**
     * Get session status
     */
    public static function getSessionStatus($sessionToken) {
        try {
            $session = DB::fetchOne(
                "SELECT * FROM exam_sessions WHERE session_token = ?",
                [$sessionToken]
            );
            
            if (!$session) {
                return ['success' => false, 'message' => 'Session not found'];
            }
            
            // Check if session expired
            $startTime = strtotime($session['start_time']);
            $maxDuration = $session['duration_minutes'] * 60;
            $elapsed = time() - $startTime;
            
            if ($elapsed >= $maxDuration && $session['status'] === 'active') {
                // Mark as expired
                DB::execute(
                    "UPDATE exam_sessions SET status = 'expired' WHERE session_token = ?",
                    [$sessionToken]
                );
                $session['status'] = 'expired';
            }
            
            return [
                'success' => true,
                'status' => $session['status'],
                'time_remaining' => max(0, $session['time_remaining']),
                'answers' => json_decode($session['answers'] ?? '{}', true)
            ];
            
        } catch (\Exception $e) {
            error_log("Failed to get session status: " . $e->getMessage());
            return ['success' => false, 'message' => 'Failed to get session status'];
        }
    }
}