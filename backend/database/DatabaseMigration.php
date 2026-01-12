<?php

namespace App\Database;

use App\Core\DB;
use PDO;
use Exception;

class DatabaseMigration {
    
    private static function executeSqlFile($filePath) {
        if (!file_exists($filePath)) {
            throw new Exception("SQL file not found: $filePath");
        }
        
        $sql = file_get_contents($filePath);
        
        // Split SQL into individual statements
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
            }
        );
        
        $conn = DB::conn();
        
        try {
            $conn->beginTransaction();
            
            foreach ($statements as $statement) {
                if (!empty(trim($statement))) {
                    $conn->exec($statement);
                    echo "✓ Executed: " . substr(trim($statement), 0, 50) . "...\n";
                }
            }
            
            $conn->commit();
            return true;
            
        } catch (Exception $e) {
            $conn->rollBack();
            throw new Exception("Migration failed: " . $e->getMessage());
        }
    }
    
    public static function migrate() {
        echo "Starting database migration...\n";
        
        try {
            // Run core tables migration
            echo "\n1. Creating core tables...\n";
            self::executeSqlFile(__DIR__ . '/migrations/001_create_core_tables.sql');
            
            echo "\n2. Seeding associations and ranks...\n";
            self::executeSqlFile(__DIR__ . '/seeds/001_seed_associations_and_ranks.sql');
            
            echo "\n3. Seeding sample data...\n";
            self::executeSqlFile(__DIR__ . '/seeds/002_seed_sample_data.sql');
            
            echo "\n✅ Database migration completed successfully!\n";
            return true;
            
        } catch (Exception $e) {
            echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public static function reset() {
        echo "Resetting database...\n";
        
        try {
            $conn = DB::conn();
            
            // Get all tables
            $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            
            // Disable foreign key checks
            $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
            
            // Drop all tables
            foreach ($tables as $table) {
                $conn->exec("DROP TABLE IF EXISTS `$table`");
                echo "✓ Dropped table: $table\n";
            }
            
            // Re-enable foreign key checks
            $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
            
            echo "\n✅ Database reset completed!\n";
            return true;
            
        } catch (Exception $e) {
            echo "\n❌ Reset failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    public static function seed() {
        echo "Seeding database with sample data...\n";
        
        try {
            self::executeSqlFile(__DIR__ . '/seeds/001_seed_associations_and_ranks.sql');
            self::executeSqlFile(__DIR__ . '/seeds/002_seed_sample_data.sql');
            
            echo "\n✅ Database seeding completed!\n";
            return true;
            
        } catch (Exception $e) {
            echo "\n❌ Seeding failed: " . $e->getMessage() . "\n";
            return false;
        }
    }
}