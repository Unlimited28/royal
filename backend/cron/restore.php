<?php
/**
 * Database Restore Script
 * Restores database from encrypted backup
 * Usage: php restore.php [backup_filename]
 */

// Prevent web access
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This script can only be run from command line');
}

require_once dirname(__DIR__) . '/config/production.php';

class DatabaseRestore {
    private $backupDir;
    
    public function __construct() {
        $this->backupDir = dirname(__DIR__) . '/backups';
    }
    
    public function run($backupFile = null) {
        try {
            // If no backup file specified, use the latest
            if (!$backupFile) {
                $backupFile = $this->getLatestBackup();
            }
            
            if (!$backupFile) {
                throw new Exception('No backup file found');
            }
            
            $backupPath = $this->backupDir . '/' . $backupFile;
            
            if (!file_exists($backupPath)) {
                throw new Exception("Backup file not found: $backupPath");
            }
            
            echo "[" . date('Y-m-d H:i:s') . "] Starting database restore from: $backupFile\n";
            
            // Decrypt the file
            $decryptedFile = $this->decryptFile($backupPath);
            echo "[" . date('Y-m-d H:i:s') . "] File decrypted\n";
            
            // Decompress the file
            $decompressedFile = $this->decompressFile($decryptedFile);
            echo "[" . date('Y-m-d H:i:s') . "] File decompressed\n";
            
            // Restore database
            $this->restoreDatabase($decompressedFile);
            echo "[" . date('Y-m-d H:i:s') . "] Database restored successfully\n";
            
            // Clean up temporary files
            unlink($decryptedFile);
            unlink($decompressedFile);
            
            echo "[" . date('Y-m-d H:i:s') . "] Restore completed successfully\n";
            
        } catch (Exception $e) {
            echo "[" . date('Y-m-d H:i:s') . "] ERROR: " . $e->getMessage() . "\n";
            exit(1);
        }
    }
    
    private function getLatestBackup() {
        $files = glob($this->backupDir . '/backup_*.sql.gz.enc');
        
        if (empty($files)) {
            return null;
        }
        
        // Sort by modification time (newest first)
        usort($files, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        
        return basename($files[0]);
    }
    
    private function decryptFile($filepath) {
        $decryptedFile = str_replace('.enc', '', $filepath);
        
        // Read encrypted file
        $encryptedData = file_get_contents($filepath);
        if ($encryptedData === false) {
            throw new Exception('Could not read encrypted file');
        }
        
        // Extract IV (first 16 bytes)
        $iv = substr($encryptedData, 0, 16);
        $encrypted = substr($encryptedData, 16);
        
        // Decrypt using AES-256-CBC
        $decrypted = openssl_decrypt($encrypted, 'AES-256-CBC', BACKUP_ENCRYPTION_KEY, OPENSSL_RAW_DATA, $iv);
        if ($decrypted === false) {
            throw new Exception('Decryption failed');
        }
        
        // Write decrypted file
        if (file_put_contents($decryptedFile, $decrypted) === false) {
            throw new Exception('Could not write decrypted file');
        }
        
        return $decryptedFile;
    }
    
    private function decompressFile($filepath) {
        $decompressedFile = str_replace('.gz', '', $filepath);
        
        // Use gunzip to decompress
        $command = sprintf('gunzip -c %s > %s', escapeshellarg($filepath), escapeshellarg($decompressedFile));
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception('File decompression failed');
        }
        
        return $decompressedFile;
    }
    
    private function restoreDatabase($filepath) {
        // Confirm before restoring
        echo "WARNING: This will overwrite the current database. Are you sure? (y/N): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim(strtolower($line)) !== 'y') {
            throw new Exception('Restore cancelled by user');
        }
        
        // Build mysql command
        $command = sprintf(
            'mysql --host=%s --user=%s --password=%s %s < %s',
            escapeshellarg(DB_HOST),
            escapeshellarg(DB_USER),
            escapeshellarg(DB_PASS),
            escapeshellarg(DB_NAME),
            escapeshellarg($filepath)
        );
        
        // Execute mysql restore
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);
        
        if ($returnCode !== 0) {
            throw new Exception('Database restore failed: ' . implode("\n", $output));
        }
    }
    
    public function listBackups() {
        $files = glob($this->backupDir . '/backup_*.sql.gz.enc');
        
        if (empty($files)) {
            echo "No backup files found.\n";
            return;
        }
        
        echo "Available backup files:\n";
        foreach ($files as $file) {
            $filename = basename($file);
            $size = $this->formatBytes(filesize($file));
            $date = date('Y-m-d H:i:s', filemtime($file));
            echo "  $filename ($size) - $date\n";
        }
    }
    
    private function formatBytes($size, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $base = log($size, 1024);
        return round(pow(1024, $base - floor($base)), $precision) . ' ' . $units[floor($base)];
    }
}

// Parse command line arguments
$backupFile = isset($argv[1]) ? $argv[1] : null;

if (isset($argv[1]) && $argv[1] === '--list') {
    $restore = new DatabaseRestore();
    $restore->listBackups();
    exit(0);
}

// Run restore
$restore = new DatabaseRestore();
$restore->run($backupFile);