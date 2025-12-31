<?php
/**
 * Security Check Script for Royal Ambassadors Portal
 * Run this script to verify security configurations before deployment
 */

require_once __DIR__ . '/../config/config.php';

class SecurityChecker {
    private $errors = [];
    private $warnings = [];
    private $passed = [];

    public function runAllChecks() {
        echo "🔒 Royal Ambassadors Portal - Security Check\n";
        echo "==========================================\n\n";

        $this->checkEnvironmentFile();
        $this->checkFilePermissions();
        $this->checkDatabaseSecurity();
        $this->checkSessionSecurity();
        $this->checkUploadSecurity();
        $this->checkHTTPSConfiguration();
        $this->checkSecurityHeaders();

        $this->displayResults();
    }

    private function checkEnvironmentFile() {
        echo "Checking environment configuration...\n";
        
        if (!file_exists(__DIR__ . '/../.env')) {
            $this->errors[] = ".env file not found. Copy .env.example to .env";
            return;
        }

        $env = parse_ini_file(__DIR__ . '/../.env');
        
        // Check critical environment variables
        $required = ['DB_HOST', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET'];
        foreach ($required as $var) {
            if (empty($env[$var]) || $env[$var] === 'your_' . strtolower($var)) {
                $this->errors[] = "Environment variable {$var} not properly configured";
            }
        }

        // Check JWT secret strength
        if (isset($env['JWT_SECRET']) && strlen($env['JWT_SECRET']) < 32) {
            $this->errors[] = "JWT_SECRET must be at least 32 characters long";
        }

        $this->passed[] = "Environment file structure validated";
    }

    private function checkFilePermissions() {
        echo "Checking file permissions...\n";
        
        $directories = [
            'storage/logs' => 0755,
            'secure_uploads' => 0755,
            'storage/cache' => 0755
        ];

        foreach ($directories as $dir => $expectedPerm) {
            $fullPath = __DIR__ . '/../' . $dir;
            if (file_exists($fullPath)) {
                $actualPerm = fileperms($fullPath) & 0777;
                if ($actualPerm !== $expectedPerm) {
                    $this->warnings[] = "Directory {$dir} has permissions " . decoct($actualPerm) . ", expected " . decoct($expectedPerm);
                }
            } else {
                $this->errors[] = "Required directory {$dir} does not exist";
            }
        }

        // Check .env file permissions
        $envPath = __DIR__ . '/../.env';
        if (file_exists($envPath)) {
            $envPerm = fileperms($envPath) & 0777;
            if ($envPerm !== 0600) {
                $this->warnings[] = ".env file should have 600 permissions for security";
            }
        }

        $this->passed[] = "File permissions checked";
    }

    private function checkDatabaseSecurity() {
        echo "Checking database security...\n";
        
        try {
            $pdo = new PDO(
                "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'],
                $_ENV['DB_USERNAME'],
                $_ENV['DB_PASSWORD'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            
            // Check if using default credentials
            if ($_ENV['DB_USERNAME'] === 'root' && $_ENV['DB_PASSWORD'] === '') {
                $this->errors[] = "Using default database credentials is insecure";
            }

            $this->passed[] = "Database connection successful";
        } catch (PDOException $e) {
            $this->errors[] = "Database connection failed: " . $e->getMessage();
        }
    }

    private function checkSessionSecurity() {
        echo "Checking session security...\n";
        
        $sessionConfig = [
            'session.cookie_secure' => '1',
            'session.cookie_httponly' => '1',
            'session.use_strict_mode' => '1',
            'session.cookie_samesite' => 'Strict'
        ];

        foreach ($sessionConfig as $setting => $expected) {
            $actual = ini_get($setting);
            if ($actual !== $expected) {
                $this->warnings[] = "Session setting {$setting} should be {$expected}, currently {$actual}";
            }
        }

        $this->passed[] = "Session security configuration checked";
    }

    private function checkUploadSecurity() {
        echo "Checking upload security...\n";
        
        $uploadDir = __DIR__ . '/../secure_uploads';
        $htaccessFile = $uploadDir . '/.htaccess';
        
        if (!file_exists($htaccessFile)) {
            $this->errors[] = "Upload directory missing .htaccess protection";
        } else {
            $content = file_get_contents($htaccessFile);
            if (strpos($content, 'php_flag engine off') === false) {
                $this->warnings[] = "Upload directory .htaccess may not properly disable PHP execution";
            }
        }

        $this->passed[] = "Upload security checked";
    }

    private function checkHTTPSConfiguration() {
        echo "Checking HTTPS configuration...\n";
        
        if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
            $this->warnings[] = "HTTPS not detected - ensure SSL is properly configured";
        } else {
            $this->passed[] = "HTTPS properly configured";
        }
    }

    private function checkSecurityHeaders() {
        echo "Checking security headers...\n";
        
        $htaccessPath = __DIR__ . '/../.htaccess';
        if (file_exists($htaccessPath)) {
            $content = file_get_contents($htaccessPath);
            
            $requiredHeaders = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Strict-Transport-Security'
            ];

            foreach ($requiredHeaders as $header) {
                if (strpos($content, $header) === false) {
                    $this->warnings[] = "Security header {$header} not found in .htaccess";
                }
            }
        } else {
            $this->errors[] = ".htaccess file not found";
        }

        $this->passed[] = "Security headers configuration checked";
    }

    private function displayResults() {
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "SECURITY CHECK RESULTS\n";
        echo str_repeat("=", 50) . "\n\n";

        if (!empty($this->passed)) {
            echo "✅ PASSED (" . count($this->passed) . "):\n";
            foreach ($this->passed as $item) {
                echo "   • {$item}\n";
            }
            echo "\n";
        }

        if (!empty($this->warnings)) {
            echo "⚠️  WARNINGS (" . count($this->warnings) . "):\n";
            foreach ($this->warnings as $item) {
                echo "   • {$item}\n";
            }
            echo "\n";
        }

        if (!empty($this->errors)) {
            echo "❌ ERRORS (" . count($this->errors) . "):\n";
            foreach ($this->errors as $item) {
                echo "   • {$item}\n";
            }
            echo "\n";
        }

        $total = count($this->passed) + count($this->warnings) + count($this->errors);
        $score = round((count($this->passed) / $total) * 100);
        
        echo "SECURITY SCORE: {$score}%\n";
        
        if (empty($this->errors)) {
            echo "🎉 Ready for deployment!\n";
            exit(0);
        } else {
            echo "🚨 Fix errors before deployment!\n";
            exit(1);
        }
    }
}

// Run the security check
$checker = new SecurityChecker();
$checker->runAllChecks();
?>