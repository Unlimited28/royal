<?php
/**
 * Production Setup Script
 * Run this script to set up the application for production deployment
 */

// Prevent web access
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('This script can only be run from command line');
}

echo "=== Royal Ambassadors OGBC Portal - Production Setup ===\n\n";

// Check if .env file exists
if (!file_exists('.env')) {
    echo "❌ .env file not found!\n";
    echo "Please copy .env.example to .env and configure your settings.\n";
    exit(1);
}

echo "✅ .env file found\n";

// Load configuration
try {
    require_once 'config/production.php';
    echo "✅ Configuration loaded successfully\n";
} catch (Exception $e) {
    echo "❌ Configuration error: " . $e->getMessage() . "\n";
    exit(1);
}

// Test database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
    echo "✅ Database connection successful\n";
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Create necessary directories
$directories = ['logs', 'backups', 'cache'];
foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        if (mkdir($dir, 0750, true)) {
            echo "✅ Created directory: $dir\n";
        } else {
            echo "❌ Failed to create directory: $dir\n";
        }
    } else {
        echo "✅ Directory exists: $dir\n";
    }
}

// Set up database indexes for performance
require_once 'config/performance.php';
$optimizer = new PerformanceOptimizer($pdo);

echo "\n--- Setting up database indexes ---\n";
$indexCount = $optimizer->createIndexes();
echo "✅ Created $indexCount database indexes\n";

// Disable debug files
$debugFiles = [
    'test_system_functionality.php',
    'info.php',
    'phpinfo.php'
];

foreach ($debugFiles as $file) {
    if (file_exists($file)) {
        if (rename($file, $file . '.disabled')) {
            echo "✅ Disabled debug file: $file\n";
        } else {
            echo "⚠️  Warning: Could not disable debug file: $file\n";
        }
    }
}

// Copy production .htaccess
if (file_exists('.htaccess.production')) {
    if (copy('.htaccess.production', '.htaccess')) {
        echo "✅ Production .htaccess configured\n";
    } else {
        echo "⚠️  Warning: Could not copy production .htaccess\n";
    }
}

// Set up cron job reminder
echo "\n--- Cron Job Setup ---\n";
echo "⚠️  Don't forget to set up the backup cron job:\n";
echo "Add this line to your crontab (crontab -e):\n";
echo "0 2 * * * /usr/bin/php " . __DIR__ . "/cron/backup.php\n";

// Security recommendations
echo "\n--- Security Recommendations ---\n";
echo "1. Change default admin passcodes in .env file\n";
echo "2. Set up SSL certificate for HTTPS\n";
echo "3. Configure firewall to allow only necessary ports\n";
echo "4. Set up regular security updates\n";
echo "5. Monitor logs regularly\n";

// Performance recommendations
echo "\n--- Performance Recommendations ---\n";
echo "1. Enable PHP OPcache in php.ini\n";
echo "2. Consider setting up Redis for caching\n";
echo "3. Monitor slow queries in MySQL\n";
echo "4. Set up CDN for static assets\n";
echo "5. Enable gzip compression in web server\n";

echo "\n✅ Production setup completed successfully!\n";
echo "Your application is ready for production deployment.\n";