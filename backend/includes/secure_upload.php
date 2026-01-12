<?php
/**
 * Secure File Upload Handler
 * Enhanced security for file uploads with proper validation and storage
 */

require_once __DIR__ . '/security.php';
require_once __DIR__ . '/error_handler.php';

class SecureFileUpload {
    private $uploadDir;
    private $allowedTypes;
    private $maxFileSize;
    private $allowedMimeTypes;
    
    public function __construct() {
        // Store uploads outside public directory for security
        $this->uploadDir = dirname(__DIR__) . '/secure_uploads/';
        $this->maxFileSize = 2 * 1024 * 1024; // 2MB
        
        $this->allowedTypes = [
            'jpg', 'jpeg', 'png', 'pdf'
        ];
        
        $this->allowedMimeTypes = [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'application/pdf' => ['pdf']
        ];
        
        $this->createSecureUploadDir();
    }
    
    /**
     * Create secure upload directory structure
     */
    private function createSecureUploadDir() {
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
            
            // Create .htaccess to prevent direct access
            $htaccessContent = "Order deny,allow\nDeny from all\n";
            file_put_contents($this->uploadDir . '.htaccess', $htaccessContent);
        }
        
        // Create subdirectories
        $subdirs = ['documents', 'images', 'temp'];
        foreach ($subdirs as $subdir) {
            $path = $this->uploadDir . $subdir . '/';
            if (!file_exists($path)) {
                mkdir($path, 0755, true);
            }
        }
    }
    
    /**
     * Handle secure file upload
     */
    public function uploadFile($file, $category = 'documents') {
        try {
            // Validate file
            $validation = $this->validateFile($file);
            if (!$validation['valid']) {
                return [
                    'success' => false,
                    'errors' => $validation['errors']
                ];
            }
            
            // Generate secure filename
            $secureFilename = $this->generateSecureFilename($file['name']);
            $uploadPath = $this->uploadDir . $category . '/' . $secureFilename;
            
            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                // Set proper permissions
                chmod($uploadPath, 0644);
                
                // Log successful upload
                ErrorHandler::logError("File uploaded successfully: {$secureFilename}", [
                    'original_name' => $file['name'],
                    'size' => $file['size'],
                    'category' => $category
                ]);
                
                return [
                    'success' => true,
                    'filename' => $secureFilename,
                    'path' => $uploadPath,
                    'size' => $file['size'],
                    'category' => $category
                ];
            } else {
                throw new Exception('Failed to move uploaded file');
            }
            
        } catch (Exception $e) {
            ErrorHandler::logError("File upload failed: " . $e->getMessage(), [
                'file' => $file['name'] ?? 'unknown',
                'category' => $category
            ]);
            
            return [
                'success' => false,
                'errors' => ['Upload failed: ' . $e->getMessage()]
            ];
        }
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        $errors = [];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = $this->getUploadErrorMessage($file['error']);
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            $sizeMB = $this->maxFileSize / (1024 * 1024);
            $errors[] = "File size exceeds maximum allowed size of {$sizeMB}MB";
        }
        
        // Check if file is empty
        if ($file['size'] === 0) {
            $errors[] = "File is empty";
        }
        
        // Validate file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedTypes)) {
            $errors[] = "Invalid file type. Allowed types: " . implode(', ', $this->allowedTypes);
        }
        
        // Validate MIME type
        if (!empty($file['tmp_name'])) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            
            if (!array_key_exists($mimeType, $this->allowedMimeTypes)) {
                $errors[] = "Invalid file content type";
            } elseif (!in_array($extension, $this->allowedMimeTypes[$mimeType])) {
                $errors[] = "File extension does not match file content";
            }
        }
        
        // Check for dangerous file patterns
        if (preg_match('/\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi|exe|bat|com|scr|vbs|js)$/i', $file['name'])) {
            $errors[] = "Potentially dangerous file type detected";
        }
        
        // Additional security checks
        if (strpos($file['name'], '..') !== false || strpos($file['name'], '/') !== false || strpos($file['name'], '\\') !== false) {
            $errors[] = "Invalid characters in filename";
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Generate secure filename
     */
    private function generateSecureFilename($originalName) {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $hash = hash('sha256', $originalName . time() . random_bytes(16));
        return substr($hash, 0, 32) . '.' . $extension;
    }
    
    /**
     * Get upload error message
     */
    private function getUploadErrorMessage($errorCode) {
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
     * Delete uploaded file
     */
    public function deleteFile($filename, $category = 'documents') {
        $filepath = $this->uploadDir . $category . '/' . $filename;
        
        if (file_exists($filepath)) {
            if (unlink($filepath)) {
                ErrorHandler::logError("File deleted: {$filename}", ['category' => $category]);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get file for download (secure access)
     */
    public function getFile($filename, $category = 'documents') {
        $filepath = $this->uploadDir . $category . '/' . $filename;
        
        if (file_exists($filepath) && is_readable($filepath)) {
            return [
                'path' => $filepath,
                'size' => filesize($filepath),
                'mime' => mime_content_type($filepath)
            ];
        }
        
        return false;
    }
}
?>