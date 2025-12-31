<?php
/**
 * File Upload Utility with Validation
 * Handles secure file uploads with size, type, and security validation
 */

class FileUploadHandler {
    private $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB
    private $maxImageSize = 2 * 1024 * 1024; // 2MB for images
    private $uploadPath;
    
    public function __construct($uploadPath = '../assets/uploads/') {
        $this->uploadPath = $uploadPath;
        $this->createDirectoryIfNotExists();
    }
    
    private function createDirectoryIfNotExists() {
        if (!file_exists($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }
    
    /**
     * Validate file type and size
     */
    public function validateFile($file, $allowedTypes = null) {
        $errors = [];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors[] = 'Upload failed with error code: ' . $file['error'];
            return $errors;
        }
        
        // Use default image types if none specified
        $allowedTypes = $allowedTypes ?: $this->allowedImageTypes;
        
        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            $errors[] = 'Invalid file type. Allowed types: ' . implode(', ', $allowedTypes);
        }
        
        // Check file size
        $maxSize = in_array($mimeType, $this->allowedImageTypes) ? $this->maxImageSize : $this->maxFileSize;
        if ($file['size'] > $maxSize) {
            $sizeLimit = $maxSize / (1024 * 1024);
            $errors[] = "File too large. Maximum size: {$sizeLimit}MB";
        }
        
        // Additional security checks
        $filename = $file['name'];
        if (preg_match('/\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$/i', $filename)) {
            $errors[] = 'Potentially dangerous file type detected';
        }
        
        return $errors;
    }
    
    /**
     * Upload file with validation
     */
    public function uploadFile($file, $subfolder = '', $allowedTypes = null) {
        $errors = $this->validateFile($file, $allowedTypes);
        
        if (!empty($errors)) {
            return ['success' => false, 'errors' => $errors];
        }
        
        $uploadDir = $this->uploadPath . $subfolder;
        if (!empty($subfolder) && !file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . '/' . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return [
                'success' => true,
                'filename' => $filename,
                'filepath' => $filepath,
                'relative_path' => str_replace('../', '', $filepath)
            ];
        } else {
            return ['success' => false, 'errors' => ['Failed to move uploaded file']];
        }
    }
    
    /**
     * Upload multiple files
     */
    public function uploadMultipleFiles($files, $subfolder = '', $allowedTypes = null) {
        $results = [];
        $allErrors = [];
        
        for ($i = 0; $i < count($files['name']); $i++) {
            $file = [
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            ];
            
            $result = $this->uploadFile($file, $subfolder, $allowedTypes);
            $results[] = $result;
            
            if (!$result['success']) {
                $allErrors = array_merge($allErrors, $result['errors']);
            }
        }
        
        return [
            'results' => $results,
            'errors' => $allErrors,
            'success' => empty($allErrors)
        ];
    }
    
    /**
     * Delete uploaded file
     */
    public function deleteFile($filepath) {
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }
}
?>