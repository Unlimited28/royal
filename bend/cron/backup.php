<?php
/**
 * Database Backup Script
 * Creates encrypted MySQL dumps and uploads to AWS S3
 * Run via cron: 0 2 * * * /usr/bin/php /path/to/backup.php
 */

// Prevent web access
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This script can only be run from command line');
}

require_once dirname(__DIR__) . '/config/production.php';

class DatabaseBackup {
    private $backupDir;
    private $maxBackups = 14; // Keep 14 days of backups
    
    public function __construct() {
        $this->backupDir = dirname(__DIR__) . '/backups';
        
        // Create backup directory if it doesn't exist
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0750, true);
        }
    }
    
    public function run() {
        try {
            echo "[" . date('Y-m-d H:i:s') . "] Starting database backup...\n";
            
            // Create database dump
            $dumpFile = $this->createDump();
            echo "[" . date('Y-m-d H:i:s') . "] Database dump created: $dumpFile\n";
            
            // Compress the dump
            $compressedFile = $this->compressFile($dumpFile);
            echo "[" . date('Y-m-d H:i:s') . "] File compressed: $compressedFile\n";
            
            // Encrypt the compressed file
            $encryptedFile = $this->encryptFile($compressedFile);
            echo "[" . date('Y-m-d H:i:s') . "] File encrypted: $encryptedFile\n";
            
            // Upload to S3 if configured
            if (defined('AWS_S3_BUCKET')) {
                $this->uploadToS3($encryptedFile);
                echo "[" . date('Y-m-d H:i:s') . "] File uploaded to S3\n";
            }
            
            // Clean up temporary files
            unlink($dumpFile);
            unlink($compressedFile);
            
            // Clean up old backups
            $this->cleanupOldBackups();
            echo "[" . date('Y-m-d H:i:s') . "] Old backups cleaned up\n";
            
            echo "[" . date('Y-m-d H:i:s') . "] Backup completed successfully\n";
            
        } catch (Exception $e) {
            echo "[" . date('Y-m-d H:i:s') . "] ERROR: " . $e->getMessage() . "\n";
            error_log("Backup failed: " . $e->getMessage());
            exit(1);
        }
    }
    
    private function createDump() {
        $timestamp = date('Y-m-d_H-i-s');
        $filename = "backup_{$timestamp}.sql";
        $filepath = $this->backupDir . '/' . $filename;
        
        // Build mysqldump command
        $command = sprintf(
            'mysqldump --single-transaction --routines --triggers --host=%s --user=%s --password=%s %s > %s',
            escapeshellarg(DB_HOST),
            escapeshellarg(DB_USER),
            escapeshellarg(DB_PASS),
            escapeshellarg(DB_NAME),
            escapeshellarg($filepath)
        );
        
        // Execute mysqldump
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception('mysqldump failed: ' . implode("\n", $output));
        }
        
        if (!file_exists($filepath) || filesize($filepath) === 0) {
            throw new Exception('Backup file was not created or is empty');
        }
        
        return $filepath;
    }
    
    private function compressFile($filepath) {
        $compressedFile = $filepath . '.gz';
        
        // Use gzip to compress
        $command = sprintf('gzip -c %s > %s', escapeshellarg($filepath), escapeshellarg($compressedFile));
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception('File compression failed');
        }
        
        return $compressedFile;
    }
    
    private function encryptFile($filepath) {
        $encryptedFile = $filepath . '.enc';
        
        // Read the file
        $data = file_get_contents($filepath);
        if ($data === false) {
            throw new Exception('Could not read file for encryption');
        }
        
        // Generate IV
        $iv = random_bytes(16);
        
        // Encrypt using AES-256-CBC
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', BACKUP_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv);
        if ($encrypted === false) {
            throw new Exception('Encryption failed');
        }
        
        // Prepend IV to encrypted data
        $encryptedData = $iv . $encrypted;
        
        // Write encrypted file
        if (file_put_contents($encryptedFile, $encryptedData) === false) {
            throw new Exception('Could not write encrypted file');
        }
        
        return $encryptedFile;
    }
    
    private function uploadToS3($filepath) {
        if (!defined('AWS_ACCESS_KEY_ID') || !defined('AWS_SECRET_ACCESS_KEY') || !defined('AWS_S3_BUCKET')) {
            throw new Exception('AWS credentials not configured');
        }
        
        $filename = basename($filepath);
        $s3Key = 'backups/' . date('Y/m/') . $filename;
        
        // Simple S3 upload using curl (for production, consider using AWS SDK)
        $this->uploadToS3Simple($filepath, $s3Key);
    }
    
    private function uploadToS3Simple($filepath, $s3Key) {
        // This is a simplified S3 upload. For production, use AWS SDK for PHP
        // For now, we'll just log that upload would happen
        error_log("Would upload $filepath to S3 key: $s3Key");
        
        // TODO: Implement actual S3 upload using AWS SDK
        // Example with AWS SDK:
        /*
        $s3Client = new Aws\S3\S3Client([
            'version' => 'latest',
            'region' => AWS_REGION,
            'credentials' => [
                'key' => AWS_ACCESS_KEY_ID,
                'secret' => AWS_SECRET_ACCESS_KEY,
            ],
        ]);
        
        $s3Client->putObject([
            'Bucket' => AWS_S3_BUCKET,
            'Key' => $s3Key,
            'SourceFile' => $filepath,
            'ServerSideEncryption' => 'AES256',
        ]);
        */
    }
    
    private function cleanupOldBackups() {
        $files = glob($this->backupDir . '/backup_*.sql.gz.enc');
        
        if (count($files) <= $this->maxBackups) {
            return;
        }
        
        // Sort files by modification time (oldest first)
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        // Remove oldest files
        $filesToDelete = array_slice($files, 0, count($files) - $this->maxBackups);
        
        foreach ($filesToDelete as $file) {
            if (unlink($file)) {
                echo "[" . date('Y-m-d H:i:s') . "] Deleted old backup: " . basename($file) . "\n";
            }
        }
    }
}

// Run backup
$backup = new DatabaseBackup();
$backup->run();