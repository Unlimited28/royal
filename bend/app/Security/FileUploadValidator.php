<?php
namespace App\Security;

/**
 * Enhanced File Upload Security Validator
 * Comprehensive security checks for uploaded files
 */
class FileUploadValidator
{
    private $allowedTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    private $maxFileSize = 10485760; // 10MB
    private $quarantineDir;
    private $uploadDir;
    
    public function __construct($uploadDir = null)
    {
        $this->uploadDir = $uploadDir ?? UPLOADS_PATH;
        $this->quarantineDir = defined('UPLOAD_QUARANTINE_DIR') ? UPLOAD_QUARANTINE_DIR : ROOT_PATH . '/storage/quarantine';
        
        // Create directories if they don't exist
        $this->createDirectories();
    }
    
    /**
     * Validate uploaded file with comprehensive security checks
     */
    public function validateFile($file, $allowedTypes = null)
    {
        $errors = [];
        
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            $errors[] = 'Invalid file upload';
            return ['valid' => false, 'errors' => $errors];
        }
        
        // Basic file information
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];
        
        // Check for upload errors
        if ($fileError !== UPLOAD_ERR_OK) {
            $errors[] = $this->getUploadErrorMessage($fileError);
        }
        
        // File size check
        if ($fileSize > $this->maxFileSize) {
            $errors[] = 'File size exceeds maximum allowed size (' . $this->formatBytes($this->maxFileSize) . ')';
        }
        
        // File extension check
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = $allowedTypes ?? array_keys($this->allowedTypes);
        
        if (!in_array($fileExtension, $allowedExtensions)) {
            $errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $allowedExtensions);
        }
        
        // MIME type check
        $fileMimeType = mime_content_type($fileTmpName);
        if (isset($this->allowedTypes[$fileExtension]) && $fileMimeType !== $this->allowedTypes[$fileExtension]) {
            $errors[] = 'File MIME type does not match extension';
        }
        
        // File signature check (magic numbers)
        if (!$this->validateFileSignature($fileTmpName, $fileExtension)) {
            $errors[] = 'File signature validation failed';
        }
        
        // Malware scanning (basic)
        if (!$this->scanForMalware($fileTmpName)) {
            $errors[] = 'File failed security scan';
        }
        
        // Content validation for specific file types
        if (!$this->validateFileContent($fileTmpName, $fileExtension)) {
            $errors[] = 'File content validation failed';
        }
        
        // Filename security check
        if (!$this->validateFileName($fileName)) {
            $errors[] = 'Invalid filename characters detected';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'info' => [
                'original_name' => $fileName,
                'extension' => $fileExtension,
                'size' => $fileSize,
                'mime_type' => $fileMimeType
            ]
        ];
    }
    
    /**
     * Securely move uploaded file
     */
    public function moveUploadedFile($file, $destination)
    {
        $validation = $this->validateFile($file);
        
        if (!$validation['valid']) {
            return ['success' => false, 'errors' => $validation['errors']];
        }
        
        // Generate secure filename
        $secureFileName = $this->generateSecureFileName($file['name']);
        $fullPath = $this->uploadDir . '/' . $destination . '/' . $secureFileName;
        
        // Create destination directory if it doesn't exist
        $destinationDir = dirname($fullPath);
        if (!is_dir($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }
        
        // Move file
        if (move_uploaded_file($file['tmp_name'], $fullPath)) {
            // Set secure permissions
            chmod($fullPath, 0644);
            
            // Log successful upload
            $this->logFileUpload($secureFileName, $validation['info']);
            
            return [
                'success' => true,
                'filename' => $secureFileName,
                'path' => $fullPath,
                'url' => '/uploads/' . $destination . '/' . $secureFileName
            ];
        } else {
            return ['success' => false, 'errors' => ['Failed to move uploaded file']];
        }
    }
    
    /**
     * Validate file signature (magic numbers)
     */
    private function validateFileSignature($filePath, $extension)
    {
        $handle = fopen($filePath, 'rb');
        if (!$handle) return false;
        
        $bytes = fread($handle, 10);
        fclose($handle);
        
        $signatures = [
            'jpg' => ["\xFF\xD8\xFF"],
            'jpeg' => ["\xFF\xD8\xFF"],
            'png' => ["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
            'gif' => ["\x47\x49\x46\x38\x37\x61", "\x47\x49\x46\x38\x39\x61"],
            'pdf' => ["\x25\x50\x44\x46"],
            'doc' => ["\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1"],
            'docx' => ["\x50\x4B\x03\x04", "\x50\x4B\x05\x06", "\x50\x4B\x07\x08"],
            'xlsx' => ["\x50\x4B\x03\x04", "\x50\x4B\x05\x06", "\x50\x4B\x07\x08"]
        ];
        
        if (!isset($signatures[$extension])) return true;
        
        foreach ($signatures[$extension] as $signature) {
            if (strpos($bytes, $signature) === 0) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Basic malware scanning
     */
    private function scanForMalware($filePath)
    {
        // Read file content
        $content = file_get_contents($filePath);
        
        // Suspicious patterns
        $malwarePatterns = [
            '/(<script[^>]*>.*?<\/script>)/is',
            '/(<\?php.*?\?>)/is',
            '/(eval\s*\()/is',
            '/(exec\s*\()/is',
            '/(system\s*\()/is',
            '/(shell_exec\s*\()/is',
            '/(base64_decode\s*\()/is',
            '/(\$_GET\[|\$_POST\[|\$_REQUEST\[)/is'
        ];
        
        foreach ($malwarePatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                // Move to quarantine
                $this->quarantineFile($filePath);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Validate file content based on type
     */
    private function validateFileContent($filePath, $extension)
    {
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return $this->validateImageContent($filePath);
            case 'pdf':
                return $this->validatePdfContent($filePath);
            default:
                return true;
        }
    }
    
    /**
     * Validate image file content
     */
    private function validateImageContent($filePath)
    {
        $imageInfo = @getimagesize($filePath);
        return $imageInfo !== false;
    }
    
    /**
     * Validate PDF content
     */
    private function validatePdfContent($filePath)
    {
        $handle = fopen($filePath, 'rb');
        if (!$handle) return false;
        
        $header = fread($handle, 1024);
        fclose($handle);
        
        // Check for PDF header and basic structure
        return strpos($header, '%PDF-') === 0;
    }
    
    /**
     * Validate filename for security
     */
    private function validateFileName($fileName)
    {
        // Remove dangerous characters
        $dangerous = ['..', '/', '\\', '<', '>', ':', '"', '|', '?', '*', "\0"];
        
        foreach ($dangerous as $char) {
            if (strpos($fileName, $char) !== false) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Generate secure filename
     */
    private function generateSecureFileName($originalName)
    {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitize base name
        $baseName = preg_replace('/[^a-zA-Z0-9-_]/', '_', $baseName);
        $baseName = substr($baseName, 0, 50); // Limit length
        
        // Add timestamp and random string for uniqueness
        $timestamp = time();
        $random = bin2hex(random_bytes(4));
        
        return $baseName . '_' . $timestamp . '_' . $random . '.' . $extension;
    }
    
    /**
     * Move suspicious file to quarantine
     */
    private function quarantineFile($filePath)
    {
        if (!is_dir($this->quarantineDir)) {
            mkdir($this->quarantineDir, 0700, true);
        }
        
        $quarantineFile = $this->quarantineDir . '/' . uniqid('quarantine_', true);
        copy($filePath, $quarantineFile);
        
        // Log quarantine action
        error_log("File quarantined: $filePath -> $quarantineFile");
    }
    
    /**
     * Create necessary directories
     */
    private function createDirectories()
    {
        $dirs = [$this->uploadDir, $this->quarantineDir];
        
        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
    
    /**
     * Get upload error message
     */
    private function getUploadErrorMessage($errorCode)
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'File exceeds upload_max_filesize directive';
            case UPLOAD_ERR_FORM_SIZE:
                return 'File exceeds MAX_FILE_SIZE directive';
            case UPLOAD_ERR_PARTIAL:
                return 'File was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }
    
    /**
     * Format bytes to human readable
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
    
    /**
     * Log file upload activity
     */
    private function logFileUpload($filename, $info)
    {
        $logMessage = sprintf(
            "[%s] File uploaded: %s (Size: %s, Type: %s, User: %s)",
            date('Y-m-d H:i:s'),
            $filename,
            $this->formatBytes($info['size']),
            $info['mime_type'],
            $_SESSION['user_id'] ?? 'Anonymous'
        );
        
        error_log($logMessage, 3, ROOT_PATH . '/logs/uploads.log');
    }
}