<?php
/**
 * Email Queue Processor
 * Run this script via cron job every minute to process email queue
 */

require_once dirname(__DIR__) . '/app/bootstrap.php';

try {
    $processed = \App\Services\EmailService::processQueue(20);
    echo "Processed {$processed} emails\n";
    
    // Log the processing
    error_log("Email queue processed: {$processed} emails sent");
    
} catch (Exception $e) {
    error_log("Email queue processing failed: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}