<?php
/**
 * Centralized Error Handler and Logger
 * Handles all errors, exceptions, and logging for the Royal Ambassadors Portal
 */

class ErrorHandler {
    private static $logFile = null;
    private static $isInitialized = false;
    
    /**
     * Initialize error handler
     */
    public static function init() {
        if (self::$isInitialized) {
            return;
        }
        
        // Set log file path
        self::$logFile = dirname(__DIR__) . '/logs/app.log';
        
        // Create logs directory if it doesn't exist
        $logDir = dirname(self::$logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Set error reporting based on environment
        if (APP_ENV === 'development') {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
            ini_set('display_startup_errors', 1);
        } else {
            error_reporting(E_ALL);
            ini_set('display_errors', 0);
            ini_set('display_startup_errors', 0);
            ini_set('log_errors', 1);
            ini_set('error_log', self::$logFile);
        }
        
        // Set custom error and exception handlers
        set_error_handler([self::class, 'handleError']);
        set_exception_handler([self::class, 'handleException']);
        register_shutdown_function([self::class, 'handleFatalError']);
        
        self::$isInitialized = true;
    }
    
    /**
     * Handle PHP errors
     */
    public static function handleError($severity, $message, $file, $line) {
        if (!(error_reporting() & $severity)) {
            return false;
        }
        
        $errorType = self::getErrorType($severity);
        $logMessage = self::formatLogMessage($errorType, $message, $file, $line);
        
        self::logError($logMessage);
        
        if (APP_ENV === 'development') {
            echo "<div style='background: #ffebee; color: #c62828; padding: 10px; margin: 10px; border-left: 4px solid #c62828;'>";
            echo "<strong>{$errorType}:</strong> {$message} in <strong>{$file}</strong> on line <strong>{$line}</strong>";
            echo "</div>";
        }
        
        return true;
    }
    
    /**
     * Handle uncaught exceptions
     */
    public static function handleException($exception) {
        $logMessage = self::formatLogMessage(
            'EXCEPTION',
            $exception->getMessage(),
            $exception->getFile(),
            $exception->getLine(),
            $exception->getTraceAsString()
        );
        
        self::logError($logMessage);
        
        if (APP_ENV === 'development') {
            echo "<div style='background: #ffebee; color: #c62828; padding: 15px; margin: 10px; border-left: 4px solid #c62828;'>";
            echo "<h3>Uncaught Exception</h3>";
            echo "<p><strong>Message:</strong> " . htmlspecialchars($exception->getMessage()) . "</p>";
            echo "<p><strong>File:</strong> " . htmlspecialchars($exception->getFile()) . "</p>";
            echo "<p><strong>Line:</strong> " . $exception->getLine() . "</p>";
            echo "<details><summary>Stack Trace</summary><pre>" . htmlspecialchars($exception->getTraceAsString()) . "</pre></details>";
            echo "</div>";
        } else {
            self::showErrorPage(500);
        }
    }
    
    /**
     * Handle fatal errors
     */
    public static function handleFatalError() {
        $error = error_get_last();
        
        if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
            $logMessage = self::formatLogMessage(
                'FATAL ERROR',
                $error['message'],
                $error['file'],
                $error['line']
            );
            
            self::logError($logMessage);
            
            if (APP_ENV !== 'development') {
                self::showErrorPage(500);
            }
        }
    }
    
    /**
     * Log application errors
     */
    public static function logError($message, $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $requestUri = $_SERVER['REQUEST_URI'] ?? 'unknown';
        
        $logEntry = "[{$timestamp}] IP: {$ip} | URI: {$requestUri} | {$message}";
        
        if (!empty($context)) {
            $logEntry .= " | Context: " . json_encode($context);
        }
        
        $logEntry .= " | User-Agent: {$userAgent}" . PHP_EOL;
        
        file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Log security events
     */
    public static function logSecurity($event, $details = []) {
        $message = "SECURITY EVENT: {$event}";
        self::logError($message, $details);
    }
    
    /**
     * Format log message
     */
    private static function formatLogMessage($type, $message, $file, $line, $trace = null) {
        $logMessage = "{$type}: {$message} in {$file} on line {$line}";
        
        if ($trace) {
            $logMessage .= " | Trace: " . str_replace("\n", " | ", $trace);
        }
        
        return $logMessage;
    }
    
    /**
     * Get error type string
     */
    private static function getErrorType($severity) {
        switch ($severity) {
            case E_ERROR:
                return 'Fatal Error';
            case E_WARNING:
                return 'Warning';
            case E_PARSE:
                return 'Parse Error';
            case E_NOTICE:
                return 'Notice';
            case E_CORE_ERROR:
                return 'Core Error';
            case E_CORE_WARNING:
                return 'Core Warning';
            case E_COMPILE_ERROR:
                return 'Compile Error';
            case E_COMPILE_WARNING:
                return 'Compile Warning';
            case E_USER_ERROR:
                return 'User Error';
            case E_USER_WARNING:
                return 'User Warning';
            case E_USER_NOTICE:
                return 'User Notice';
            case E_STRICT:
                return 'Strict Standards';
            case E_RECOVERABLE_ERROR:
                return 'Recoverable Error';
            case E_DEPRECATED:
                return 'Deprecated';
            case E_USER_DEPRECATED:
                return 'User Deprecated';
            default:
                return 'Unknown Error';
        }
    }
    
    /**
     * Show error page
     */
    public static function showErrorPage($code = 500) {
        http_response_code($code);
        
        $errorPages = [
            404 => dirname(__DIR__) . '/error_pages/404.php',
            500 => dirname(__DIR__) . '/error_pages/500.php'
        ];
        
        if (isset($errorPages[$code]) && file_exists($errorPages[$code])) {
            include $errorPages[$code];
        } else {
            echo self::getDefaultErrorPage($code);
        }
        
        exit();
    }
    
    /**
     * Get default error page HTML
     */
    private static function getDefaultErrorPage($code) {
        $title = $code === 404 ? 'Page Not Found' : 'Internal Server Error';
        $message = $code === 404 ? 
            'The page you are looking for could not be found.' : 
            'An internal server error occurred. Please try again later.';
        
        return "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>{$title} - Royal Ambassadors Portal</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 50px; text-align: center; }
                .error-container { max-width: 600px; margin: 0 auto; background: white; padding: 50px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #e74c3c; font-size: 3em; margin: 0; }
                p { color: #666; font-size: 1.2em; margin: 20px 0; }
                a { color: #3498db; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class='error-container'>
                <h1>{$code}</h1>
                <h2>{$title}</h2>
                <p>{$message}</p>
                <p><a href='/'>Return to Home</a></p>
            </div>
        </body>
        </html>";
    }
}

// Initialize error handler
ErrorHandler::init();
?>