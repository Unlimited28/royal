<?php
/**
 * Production Error Handler for Royal Ambassadors OGBC Portal
 * FastPanel Deployment - Phase 3.3: Secure Error Handling
 */

namespace App\Core;

class ErrorHandler
{
    private $config;
    private $logFile;
    
    public function __construct($config = null)
    {
        $this->config = $config ?: require __DIR__ . '/../../config/production.php';
        $this->logFile = $this->config['error_log'];
        $this->setupErrorHandling();
    }
    
    /**
     * Setup production error handling
     */
    private function setupErrorHandling()
    {
        // Set error reporting based on environment
        if ($this->config['error_reporting']) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        } else {
            error_reporting(0);
            ini_set('display_errors', 0);
        }
        
        ini_set('log_errors', 1);
        ini_set('error_log', $this->logFile);
        
        // Set custom error handlers
        set_error_handler([$this, 'handleError']);
        set_exception_handler([$this, 'handleException']);
        register_shutdown_function([$this, 'handleShutdown']);
    }
    
    /**
     * Handle PHP errors
     */
    public function handleError($severity, $message, $file, $line)
    {
        if (!(error_reporting() & $severity)) {
            return false;
        }
        
        $errorType = $this->getErrorType($severity);
        $logMessage = sprintf(
            "[%s] %s: %s in %s on line %d",
            date('Y-m-d H:i:s'),
            $errorType,
            $message,
            $file,
            $line
        );
        
        $this->logError($logMessage);
        
        // Show custom error page in production
        if (!$this->config['display_errors']) {
            $this->showErrorPage(500);
        }
        
        return true;
    }
    
    /**
     * Handle uncaught exceptions
     */
    public function handleException($exception)
    {
        $logMessage = sprintf(
            "[%s] Uncaught Exception: %s in %s on line %d\nStack trace:\n%s",
            date('Y-m-d H:i:s'),
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getTraceAsString()
        );
        
        $this->logError($logMessage);
        
        // Show custom error page
        $this->showErrorPage(500);
    }
    
    /**
     * Handle fatal errors on shutdown
     */
    public function handleShutdown()
    {
        $error = error_get_last();
        if ($error && in_array($error['type'], [E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_PARSE])) {
            $logMessage = sprintf(
                "[%s] Fatal Error: %s in %s on line %d",
                date('Y-m-d H:i:s'),
                $error['message'],
                $error['file'],
                $error['line']
            );
            
            $this->logError($logMessage);
            $this->showErrorPage(500);
        }
    }
    
    /**
     * Show custom error page
     */
    private function showErrorPage($code)
    {
        $errorPages = $this->config['custom_error_pages'];
        
        if (isset($errorPages[$code])) {
            $errorPagePath = __DIR__ . '/../../' . ltrim($errorPages[$code], '/');
            if (file_exists($errorPagePath)) {
                http_response_code($code);
                include $errorPagePath;
                exit;
            }
        }
        
        // Fallback generic error message
        http_response_code($code);
        echo $this->getGenericErrorMessage($code);
        exit;
    }
    
    /**
     * Log error to file
     */
    private function logError($message)
    {
        // Ensure log directory exists
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents($this->logFile, $message . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Get error type string
     */
    private function getErrorType($severity)
    {
        $errorTypes = [
            E_ERROR => 'Fatal Error',
            E_WARNING => 'Warning',
            E_PARSE => 'Parse Error',
            E_NOTICE => 'Notice',
            E_CORE_ERROR => 'Core Error',
            E_CORE_WARNING => 'Core Warning',
            E_COMPILE_ERROR => 'Compile Error',
            E_COMPILE_WARNING => 'Compile Warning',
            E_USER_ERROR => 'User Error',
            E_USER_WARNING => 'User Warning',
            E_USER_NOTICE => 'User Notice',
            E_STRICT => 'Strict Standards',
            E_RECOVERABLE_ERROR => 'Recoverable Error',
            E_DEPRECATED => 'Deprecated',
            E_USER_DEPRECATED => 'User Deprecated'
        ];
        
        return $errorTypes[$severity] ?? 'Unknown Error';
    }
    
    /**
     * Get generic error message
     */
    private function getGenericErrorMessage($code)
    {
        $messages = [
            404 => 'Page Not Found',
            500 => 'Internal Server Error',
            403 => 'Access Forbidden'
        ];
        
        $message = $messages[$code] ?? 'An error occurred';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error {$code}</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                .error-container { max-width: 500px; margin: 0 auto; }
                h1 { color: #dc3545; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <div class='error-container'>
                <h1>Error {$code}</h1>
                <p>{$message}</p>
                <p>Please contact the administrator if this problem persists.</p>
            </div>
        </body>
        </html>";
    }
}