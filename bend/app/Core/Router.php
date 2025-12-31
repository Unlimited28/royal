<?php

namespace App\Core;

/**
 * Router class that matches incoming URLs to controllers
 */
class Router {
    private $routes = [];
    private $middlewares = [];
    private $currentMiddlewareGroup = [];
    
    /**
     * Add GET route
     */
    public function get($path, $handler, $middleware = []) {
        $this->addRoute('GET', $path, $handler, $middleware);
    }
    
    /**
     * Add POST route
     */
    public function post($path, $handler, $middleware = []) {
        $this->addRoute('POST', $path, $handler, $middleware);
    }
    
    /**
     * Add PUT route
     */
    public function put($path, $handler, $middleware = []) {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }
    
    /**
     * Add DELETE route
     */
    public function delete($path, $handler, $middleware = []) {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }
    
    /**
     * Add route with any method
     */
    public function any($path, $handler, $middleware = []) {
        $methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        foreach ($methods as $method) {
            $this->addRoute($method, $path, $handler, $middleware);
        }
    }
    
    /**
     * Group routes with middleware
     */
    public function group($middleware, $callback) {
        $previousMiddleware = $this->currentMiddlewareGroup;
        $this->currentMiddlewareGroup = array_merge($this->currentMiddlewareGroup, $middleware);
        
        $callback($this);
        
        $this->currentMiddlewareGroup = $previousMiddleware;
    }
    
    /**
     * Add route to routes array
     */
    private function addRoute($method, $path, $handler, $middleware = []) {
        $path = $this->normalizePath($path);
        $middleware = array_merge($this->currentMiddlewareGroup, $middleware);
        
        $this->routes[$method][$path] = [
            'handler' => $handler,
            'middleware' => $middleware,
            'params' => []
        ];
    }
    
    /**
     * Normalize path (remove trailing slash, ensure leading slash)
     */
    private function normalizePath($path) {
        $path = trim($path, '/');
        return '/' . $path;
    }
    
    /**
     * Dispatch request to appropriate handler
     */
    public function dispatch($method, $path) {
        $path = $this->normalizePath($path);
        
        // Check for exact match first
        if (isset($this->routes[$method][$path])) {
            return $this->handleRoute($this->routes[$method][$path], []);
        }
        
        // Check for parameterized routes
        foreach ($this->routes[$method] ?? [] as $routePath => $route) {
            $params = $this->matchRoute($routePath, $path);
            if ($params !== false) {
                return $this->handleRoute($route, $params);
            }
        }
        
        // No route found - 404
        $this->handle404();
    }
    
    /**
     * Match route with parameters
     */
    private function matchRoute($routePath, $requestPath) {
        // Convert route path to regex pattern
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $routePath);
        $pattern = '#^' . $pattern . '$#';
        
        if (preg_match($pattern, $requestPath, $matches)) {
            array_shift($matches); // Remove full match
            
            // Extract parameter names
            preg_match_all('/\{([^}]+)\}/', $routePath, $paramNames);
            $params = [];
            
            foreach ($paramNames[1] as $index => $paramName) {
                $params[$paramName] = $matches[$index] ?? null;
            }
            
            return $params;
        }
        
        return false;
    }
    
    /**
     * Handle matched route
     */
    private function handleRoute($route, $params) {
        // Run middleware
        foreach ($route['middleware'] as $middleware) {
            if (!$this->runMiddleware($middleware)) {
                return; // Middleware stopped execution
            }
        }
        
        // Handle the route
        $handler = $route['handler'];
        
        if (is_string($handler)) {
            // String format: "ControllerName@methodName"
            if (strpos($handler, '@') !== false) {
                list($controllerName, $methodName) = explode('@', $handler);
            } else {
                $controllerName = $handler;
                $methodName = 'index';
            }
            
            $controllerClass = "App\\Controllers\\{$controllerName}";
            
            if (class_exists($controllerClass)) {
                $controller = new $controllerClass();
                
                if (method_exists($controller, $methodName)) {
                    return call_user_func_array([$controller, $methodName], $params);
                } else {
                    throw new \Exception("Method {$methodName} not found in {$controllerClass}");
                }
            } else {
                throw new \Exception("Controller {$controllerClass} not found");
            }
        } elseif (is_callable($handler)) {
            // Closure or callable
            return call_user_func_array($handler, $params);
        }
        
        throw new \Exception("Invalid route handler");
    }
    
    /**
     * Run middleware
     */
    private function runMiddleware($middleware) {
        if (is_string($middleware)) {
            $middlewareClass = "App\\Middleware\\{$middleware}";
            
            if (class_exists($middlewareClass)) {
                $middlewareInstance = new $middlewareClass();
                return $middlewareInstance->handle();
            }
        } elseif (is_callable($middleware)) {
            return $middleware();
        }
        
        return true; // Continue if middleware not found
    }
    
    /**
     * Handle 404 errors
     */
    private function handle404() {
        http_response_code(404);
        
        // Try to load 404 view
        if (file_exists(VIEWS_PATH . '/errors/404.php')) {
            include VIEWS_PATH . '/errors/404.php';
        } else {
            echo "<h1>404 - Page Not Found</h1>";
            echo "<p>The requested page could not be found.</p>";
        }
        exit;
    }
    
    /**
     * Generate URL for named route
     */
    public function url($name, $params = []) {
        // This would be implemented if we add named routes
        // For now, return basic URL construction
        return BASE_URL . '/' . ltrim($name, '/');
    }
    
    /**
     * Redirect to URL
     */
    public function redirect($url, $statusCode = 302) {
        if (!headers_sent()) {
            header("Location: {$url}", true, $statusCode);
            exit;
        }
    }
}