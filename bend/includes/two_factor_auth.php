<?php
/**
 * Two-Factor Authentication Implementation
 * TOTP-based 2FA with QR code generation and backup codes
 */

require_once 'cache.php';

class TwoFactorAuth {
    private $pdo;
    private $cache;
    private $secret_length = 32;
    private $backup_codes_count = 10;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->cache = Cache::getInstance();
    }
    
    /**
     * Generate a new secret key for TOTP
     */
    public function generateSecret() {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        
        for ($i = 0; $i < $this->secret_length; $i++) {
            $secret .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $secret;
    }
    
    /**
     * Enable 2FA for a user
     */
    public function enable2FA($user_id, $secret = null) {
        if (!$secret) {
            $secret = $this->generateSecret();
        }
        
        // Generate backup codes
        $backup_codes = $this->generateBackupCodes();
        
        try {
            $this->pdo->beginTransaction();
            
            // Check if 2FA record exists
            $stmt = $this->pdo->prepare("SELECT id FROM user_2fa WHERE user_id = ?");
            $stmt->execute([$user_id]);
            
            if ($stmt->fetch()) {
                // Update existing record
                $stmt = $this->pdo->prepare("
                    UPDATE user_2fa 
                    SET secret = ?, backup_codes = ?, enabled = 1, enabled_at = NOW() 
                    WHERE user_id = ?
                ");
                $stmt->execute([$secret, json_encode($backup_codes), $user_id]);
            } else {
                // Insert new record
                $stmt = $this->pdo->prepare("
                    INSERT INTO user_2fa (user_id, secret, backup_codes, enabled, enabled_at) 
                    VALUES (?, ?, ?, 1, NOW())
                ");
                $stmt->execute([$user_id, $secret, json_encode($backup_codes)]);
            }
            
            $this->pdo->commit();
            
            return [
                'secret' => $secret,
                'backup_codes' => $backup_codes,
                'qr_code' => $this->generateQRCode($user_id, $secret)
            ];
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
    
    /**
     * Disable 2FA for a user
     */
    public function disable2FA($user_id) {
        $stmt = $this->pdo->prepare("
            UPDATE user_2fa 
            SET enabled = 0, disabled_at = NOW() 
            WHERE user_id = ?
        ");
        
        return $stmt->execute([$user_id]);
    }
    
    /**
     * Verify TOTP code
     */
    public function verifyTOTP($user_id, $code, $window = 1) {
        $user_2fa = $this->get2FAData($user_id);
        
        if (!$user_2fa || !$user_2fa['enabled']) {
            return false;
        }
        
        $secret = $user_2fa['secret'];
        $current_time = time();
        
        // Check current time and adjacent time windows
        for ($i = -$window; $i <= $window; $i++) {
            $time_slice = intval(($current_time + ($i * 30)) / 30);
            $calculated_code = $this->calculateTOTP($secret, $time_slice);
            
            if (hash_equals($calculated_code, $code)) {
                // Prevent replay attacks
                if ($this->isCodeUsed($user_id, $code, $time_slice)) {
                    return false;
                }
                
                $this->markCodeAsUsed($user_id, $code, $time_slice);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Verify backup code
     */
    public function verifyBackupCode($user_id, $code) {
        $user_2fa = $this->get2FAData($user_id);
        
        if (!$user_2fa || !$user_2fa['enabled']) {
            return false;
        }
        
        $backup_codes = json_decode($user_2fa['backup_codes'], true);
        
        foreach ($backup_codes as $index => $backup_code) {
            if (hash_equals($backup_code, $code)) {
                // Remove used backup code
                unset($backup_codes[$index]);
                
                $stmt = $this->pdo->prepare("
                    UPDATE user_2fa 
                    SET backup_codes = ? 
                    WHERE user_id = ?
                ");
                $stmt->execute([json_encode(array_values($backup_codes)), $user_id]);
                
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if user has 2FA enabled
     */
    public function is2FAEnabled($user_id) {
        $user_2fa = $this->get2FAData($user_id);
        return $user_2fa && $user_2fa['enabled'];
    }
    
    /**
     * Get 2FA data for user
     */
    private function get2FAData($user_id) {
        $cache_key = "user_2fa_{$user_id}";
        
        return $this->cache->remember($cache_key, function() use ($user_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM user_2fa WHERE user_id = ?");
            $stmt->execute([$user_id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }, 300);
    }
    
    /**
     * Calculate TOTP code
     */
    private function calculateTOTP($secret, $time_slice) {
        $secret_key = $this->base32Decode($secret);
        $time = pack('N*', 0) . pack('N*', $time_slice);
        $hash = hash_hmac('sha1', $time, $secret_key, true);
        $offset = ord($hash[19]) & 0xf;
        $code = (
            ((ord($hash[$offset + 0]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        ) % 1000000;
        
        return str_pad($code, 6, '0', STR_PAD_LEFT);
    }
    
    /**
     * Base32 decode
     */
    private function base32Decode($secret) {
        $base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32charsFlipped = array_flip(str_split($base32chars));
        
        $paddingCharCount = substr_count($secret, '=');
        $allowedValues = array(6, 4, 3, 1, 0);
        
        if (!in_array($paddingCharCount, $allowedValues)) {
            return false;
        }
        
        for ($i = 0; $i < 4; $i++) {
            if ($paddingCharCount == $allowedValues[$i] &&
                substr($secret, -($allowedValues[$i])) != str_repeat('=', $allowedValues[$i])) {
                return false;
            }
        }
        
        $secret = str_replace('=', '', $secret);
        $secret = str_split($secret);
        $binaryString = '';
        
        for ($i = 0; $i < count($secret); $i = $i + 8) {
            $x = '';
            if (!in_array($secret[$i], $base32charsFlipped)) {
                return false;
            }
            for ($j = 0; $j < 8; $j++) {
                $x .= str_pad(base_convert(@$base32charsFlipped[@$secret[$i + $j]], 10, 2), 5, '0', STR_PAD_LEFT);
            }
            $eightBits = str_split($x, 8);
            for ($z = 0; $z < count($eightBits); $z++) {
                $binaryString .= (($y = chr(base_convert($eightBits[$z], 2, 10))) || ord($y) == 48) ? $y : '';
            }
        }
        
        return $binaryString;
    }
    
    /**
     * Generate backup codes
     */
    private function generateBackupCodes() {
        $codes = [];
        
        for ($i = 0; $i < $this->backup_codes_count; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        
        return $codes;
    }
    
    /**
     * Generate QR code data URL
     */
    private function generateQRCode($user_id, $secret) {
        // Get user email for QR code
        $stmt = $this->pdo->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('User not found');
        }
        
        $issuer = urlencode(APP_NAME);
        $email = urlencode($user['email']);
        $totp_url = "otpauth://totp/{$issuer}:{$email}?secret={$secret}&issuer={$issuer}";
        
        // Generate QR code using Google Charts API (fallback)
        $qr_url = "https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=" . urlencode($totp_url);
        
        return [
            'url' => $totp_url,
            'qr_image_url' => $qr_url
        ];
    }
    
    /**
     * Check if code was already used (prevent replay attacks)
     */
    private function isCodeUsed($user_id, $code, $time_slice) {
        $cache_key = "used_totp_{$user_id}_{$code}_{$time_slice}";
        return $this->cache->has($cache_key);
    }
    
    /**
     * Mark code as used
     */
    private function markCodeAsUsed($user_id, $code, $time_slice) {
        $cache_key = "used_totp_{$user_id}_{$code}_{$time_slice}";
        $this->cache->set($cache_key, true, 60); // Cache for 1 minute
    }
    
    /**
     * Generate new backup codes
     */
    public function regenerateBackupCodes($user_id) {
        $backup_codes = $this->generateBackupCodes();
        
        $stmt = $this->pdo->prepare("
            UPDATE user_2fa 
            SET backup_codes = ? 
            WHERE user_id = ? AND enabled = 1
        ");
        
        if ($stmt->execute([json_encode($backup_codes), $user_id])) {
            return $backup_codes;
        }
        
        return false;
    }
}

// Create 2FA table if it doesn't exist
function create_2fa_table($pdo) {
    $sql = "
        CREATE TABLE IF NOT EXISTS user_2fa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            secret VARCHAR(64) NOT NULL,
            backup_codes JSON,
            enabled BOOLEAN DEFAULT 0,
            enabled_at TIMESTAMP NULL,
            disabled_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_2fa (user_id),
            INDEX idx_2fa_enabled (enabled)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $pdo->exec($sql);
}

// Helper functions
function get_2fa_instance() {
    global $pdo;
    static $instance = null;
    
    if ($instance === null) {
        create_2fa_table($pdo);
        $instance = new TwoFactorAuth($pdo);
    }
    
    return $instance;
}