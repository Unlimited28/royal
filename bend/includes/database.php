<?php
/**
 * Database Connection and Query Helper
 * Royal Ambassadors OGBC Portal
 */

require_once __DIR__ . '/../config/config.php';

class DB {
    private static $connection = null;
    private static $host;
    private static $dbname;
    private static $username;
    private static $password;
    
    /**
     * Initialize database connection
     */
    private static function connect() {
        if (self::$connection === null) {
            self::$host = DB_HOST;
            self::$dbname = DB_NAME;
            self::$username = DB_USER;
            self::$password = DB_PASS;
            
            try {
                $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                self::$connection = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ]);
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                
                // For development, show error. For production, show generic message
                if (APP_ENV === 'development') {
                    die("Database connection failed: " . $e->getMessage());
                } else {
                    die("Database connection failed. Please contact administrator.");
                }
            }
        }
        
        return self::$connection;
    }
    
    /**
     * Execute a query and return all results
     */
    public static function fetchAll($sql, $params = []) {
        try {
            $pdo = self::connect();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage() . " SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Execute a query and return single result
     */
    public static function fetchOne($sql, $params = []) {
        try {
            $pdo = self::connect();
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Database query error: " . $e->getMessage() . " SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Execute an INSERT, UPDATE, or DELETE query
     */
    public static function execute($sql, $params = []) {
        try {
            $pdo = self::connect();
            $stmt = $pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Database execute error: " . $e->getMessage() . " SQL: " . $sql);
            return false;
        }
    }
    
    /**
     * Get the last inserted ID
     */
    public static function lastInsertId() {
        try {
            $pdo = self::connect();
            return $pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log("Database lastInsertId error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Begin transaction
     */
    public static function beginTransaction() {
        try {
            $pdo = self::connect();
            return $pdo->beginTransaction();
        } catch (PDOException $e) {
            error_log("Database beginTransaction error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Commit transaction
     */
    public static function commit() {
        try {
            $pdo = self::connect();
            return $pdo->commit();
        } catch (PDOException $e) {
            error_log("Database commit error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Rollback transaction
     */
    public static function rollback() {
        try {
            $pdo = self::connect();
            return $pdo->rollback();
        } catch (PDOException $e) {
            error_log("Database rollback error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Test database connection
     */
    public static function testConnection() {
        try {
            $pdo = self::connect();
            $stmt = $pdo->query("SELECT 1");
            return $stmt !== false;
        } catch (Exception $e) {
            error_log("Database connection test failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get database connection info for debugging
     */
    public static function getConnectionInfo() {
        return [
            'host' => self::$host ?? DB_HOST,
            'database' => self::$dbname ?? DB_NAME,
            'username' => self::$username ?? DB_USER,
            'connected' => self::$connection !== null
        ];
    }
}

// Test connection on include (only in development)
if (APP_ENV === 'development') {
    if (!DB::testConnection()) {
        error_log("Warning: Database connection test failed during include");
    }
}
?>