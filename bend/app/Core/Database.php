<?php
/**
 * Core Database Class - Alternative location for autoloader
 * This is a duplicate of includes/database.php for compatibility
 */

namespace App\Core;

require_once __DIR__ . '/../../includes/database.php';

// Create alias for the global DB class
class Database extends \DB {
    // This class extends the global DB class for namespace compatibility
}
?>