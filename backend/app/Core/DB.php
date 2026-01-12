<?php

namespace App\Core;

use PDO;
use PDOException;
use Exception;

/**
 * Database class with PDO + Connection Pooling
 */
class DB {
    private static $connection = null;
    private static $connectionPool = [];
    private static $maxConnections = 5;
    
    /**
     * Get database connection with connection pooling
     */
    public static function conn() {
        if (self::$connection === null) {
            self::connect();
        }
        
        // Check if connection is still alive
        try {
            self::$connection->query('SELECT 1');
        } catch (PDOException $e) {
            self::connect();
        }
        
        return self::$connection;
    }
    
    /**
     * Create new database connection
     */
    private static function connect() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_TIMEOUT => 10,
            ];
            
            self::$connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Set SQL mode for better compatibility
            self::$connection->exec("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
            
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            
            if (APP_ENV === 'development') {
                die("Database connection failed: " . $e->getMessage());
            } else {
                die("Database connection failed. Please try again later.");
            }
        }
    }
    
    /**
     * Execute prepared statement with parameters
     */
    public static function query($sql, $params = []) {
        try {
            $stmt = self::conn()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Database query failed: " . $e->getMessage() . " SQL: " . $sql);
            throw new Exception("Database query failed: " . $e->getMessage());
        }
    }
    
    /**
     * Get single row
     */
    public static function fetchOne($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetch();
    }
    
    /**
     * Get all rows
     */
    public static function fetchAll($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * Insert and return last insert ID
     */
    public static function insert($sql, $params = []) {
        self::query($sql, $params);
        return self::conn()->lastInsertId();
    }
    
    /**
     * Update/Delete and return affected rows
     */
    public static function execute($sql, $params = []) {
        $stmt = self::query($sql, $params);
        return $stmt->rowCount();
    }
    
    /**
     * Begin transaction
     */
    public static function beginTransaction() {
        return self::conn()->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public static function commit() {
        return self::conn()->commit();
    }
    
    /**
     * Rollback transaction
     */
    public static function rollback() {
        return self::conn()->rollback();
    }
    
    /**
     * Check if table exists
     */
    public static function tableExists($tableName) {
        $sql = "SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_schema = ? AND table_name = ?";
        $result = self::fetchOne($sql, [DB_NAME, $tableName]);
        return $result['COUNT(*)'] > 0;
    }
    
    /**
     * Get table columns
     */
    public static function getTableColumns($tableName) {
        $sql = "SHOW COLUMNS FROM `$tableName`";
        return self::fetchAll($sql);
    }
}

// Alias for backward compatibility
class Database extends DB {}