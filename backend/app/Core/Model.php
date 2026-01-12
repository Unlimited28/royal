<?php

namespace App\Core;

/**
 * Base model for database interaction
 */
abstract class Model {
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $guarded = ['id', 'created_at', 'updated_at'];
    protected $timestamps = true;
    
    /**
     * Find record by ID
     */
    public static function find($id) {
        $instance = new static();
        return DB::fetchOne(
            "SELECT * FROM {$instance->table} WHERE {$instance->primaryKey} = ?",
            [$id]
        );
    }
    
    /**
     * Find record by ID or fail
     */
    public static function findOrFail($id) {
        $result = static::find($id);
        if (!$result) {
            throw new \Exception("Record not found with ID: {$id}");
        }
        return $result;
    }
    
    /**
     * Find record by column
     */
    public static function findBy($column, $value) {
        $instance = new static();
        return DB::fetchOne(
            "SELECT * FROM {$instance->table} WHERE {$column} = ?",
            [$value]
        );
    }
    
    /**
     * Get all records
     */
    public static function all($orderBy = null) {
        $instance = new static();
        $sql = "SELECT * FROM {$instance->table}";
        
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }
        
        return DB::fetchAll($sql);
    }
    
    /**
     * Get records with where condition
     */
    public static function where($column, $operator = '=', $value = null) {
        $instance = new static();
        
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }
        
        return new QueryBuilder($instance->table, $column, $operator, $value);
    }
    
    /**
     * Create new record
     */
    public static function create($attributes) {
        $instance = new static();
        $attributes = $instance->filterFillable($attributes);
        
        if ($instance->timestamps) {
            $attributes['created_at'] = date('Y-m-d H:i:s');
            $attributes['updated_at'] = date('Y-m-d H:i:s');
        }
        
        $columns = implode(', ', array_keys($attributes));
        $placeholders = ':' . implode(', :', array_keys($attributes));
        
        $id = DB::insert(
            "INSERT INTO {$instance->table} ({$columns}) VALUES ({$placeholders})",
            $attributes
        );
        
        return static::find($id);
    }
    
    /**
     * Update record
     */
    public static function update($id, $attributes) {
        $instance = new static();
        $attributes = $instance->filterFillable($attributes);
        
        if ($instance->timestamps) {
            $attributes['updated_at'] = date('Y-m-d H:i:s');
        }
        
        $setPairs = [];
        foreach (array_keys($attributes) as $column) {
            $setPairs[] = "{$column} = :{$column}";
        }
        $setClause = implode(', ', $setPairs);
        
        $attributes[$instance->primaryKey] = $id;
        
        DB::execute(
            "UPDATE {$instance->table} SET {$setClause} WHERE {$instance->primaryKey} = :{$instance->primaryKey}",
            $attributes
        );
        
        return static::find($id);
    }
    
    /**
     * Delete record
     */
    public static function delete($id) {
        $instance = new static();
        return DB::execute(
            "DELETE FROM {$instance->table} WHERE {$instance->primaryKey} = ?",
            [$id]
        );
    }
    
    /**
     * Soft delete record (if deleted_at column exists)
     */
    public static function softDelete($id) {
        $instance = new static();
        return DB::execute(
            "UPDATE {$instance->table} SET deleted_at = NOW() WHERE {$instance->primaryKey} = ?",
            [$id]
        );
    }
    
    /**
     * Count records
     */
    public static function count($column = '*', $value = null) {
        $instance = new static();
        
        if ($value !== null) {
            $result = DB::fetchOne(
                "SELECT COUNT(*) as count FROM {$instance->table} WHERE {$column} = ?",
                [$value]
            );
        } else {
            $result = DB::fetchOne("SELECT COUNT(*) as count FROM {$instance->table}");
        }
        
        return (int)$result['count'];
    }
    
    /**
     * Check if record exists
     */
    public static function exists($column, $value) {
        return static::count($column, $value) > 0;
    }
    
    /**
     * Get paginated results
     */
    public static function paginate($page = 1, $perPage = 20, $orderBy = null) {
        $instance = new static();
        $page = max(1, (int)$page);
        $perPage = min($perPage, 100);
        $offset = ($page - 1) * $perPage;
        
        // Get total count
        $total = static::count();
        
        // Get paginated results
        $sql = "SELECT * FROM {$instance->table}";
        if ($orderBy) {
            $sql .= " ORDER BY {$orderBy}";
        }
        $sql .= " LIMIT {$perPage} OFFSET {$offset}";
        
        $results = DB::fetchAll($sql);
        
        return [
            'data' => $results,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage),
                'has_prev' => $page > 1,
                'has_next' => $page < ceil($total / $perPage)
            ]
        ];
    }
    
    /**
     * Filter attributes based on fillable/guarded
     */
    protected function filterFillable($attributes) {
        if (!empty($this->fillable)) {
            return array_intersect_key($attributes, array_flip($this->fillable));
        }
        
        if (!empty($this->guarded)) {
            return array_diff_key($attributes, array_flip($this->guarded));
        }
        
        return $attributes;
    }
    
    /**
     * Execute raw SQL query
     */
    public static function raw($sql, $params = []) {
        return DB::fetchAll($sql, $params);
    }
    
    /**
     * Execute raw SQL query and get single result
     */
    public static function rawOne($sql, $params = []) {
        return DB::fetchOne($sql, $params);
    }
}

/**
 * Query Builder for chaining where conditions
 */
class QueryBuilder {
    private $table;
    private $wheres = [];
    private $params = [];
    private $orderBy = [];
    private $limit = null;
    private $offset = null;
    
    public function __construct($table, $column = null, $operator = null, $value = null) {
        $this->table = $table;
        
        if ($column && $operator && $value !== null) {
            $this->where($column, $operator, $value);
        }
    }
    
    /**
     * Add where condition
     */
    public function where($column, $operator = '=', $value = null) {
        if ($value === null) {
            $value = $operator;
            $operator = '=';
        }
        
        $this->wheres[] = "{$column} {$operator} ?";
        $this->params[] = $value;
        
        return $this;
    }
    
    /**
     * Add where in condition
     */
    public function whereIn($column, $values) {
        $placeholders = str_repeat('?,', count($values) - 1) . '?';
        $this->wheres[] = "{$column} IN ({$placeholders})";
        $this->params = array_merge($this->params, $values);
        
        return $this;
    }
    
    /**
     * Add where not null condition
     */
    public function whereNotNull($column) {
        $this->wheres[] = "{$column} IS NOT NULL";
        return $this;
    }
    
    /**
     * Add where null condition
     */
    public function whereNull($column) {
        $this->wheres[] = "{$column} IS NULL";
        return $this;
    }
    
    /**
     * Add order by
     */
    public function orderBy($column, $direction = 'ASC') {
        $this->orderBy[] = "{$column} {$direction}";
        return $this;
    }
    
    /**
     * Add limit
     */
    public function limit($limit) {
        $this->limit = $limit;
        return $this;
    }
    
    /**
     * Add offset
     */
    public function offset($offset) {
        $this->offset = $offset;
        return $this;
    }
    
    /**
     * Get first result
     */
    public function first() {
        $this->limit(1);
        $results = $this->get();
        return !empty($results) ? $results[0] : null;
    }
    
    /**
     * Get all results
     */
    public function get() {
        $sql = "SELECT * FROM {$this->table}";
        
        if (!empty($this->wheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->wheres);
        }
        
        if (!empty($this->orderBy)) {
            $sql .= " ORDER BY " . implode(', ', $this->orderBy);
        }
        
        if ($this->limit) {
            $sql .= " LIMIT {$this->limit}";
        }
        
        if ($this->offset) {
            $sql .= " OFFSET {$this->offset}";
        }
        
        return DB::fetchAll($sql, $this->params);
    }
    
    /**
     * Count results
     */
    public function count() {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}";
        
        if (!empty($this->wheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->wheres);
        }
        
        $result = DB::fetchOne($sql, $this->params);
        return (int)$result['count'];
    }
}