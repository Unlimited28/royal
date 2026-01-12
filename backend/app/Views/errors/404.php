<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | Royal Ambassadors OGBC</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #1e3d59 0%, #17a2b8 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .error-container {
            text-align: center;
            color: white;
        }
        .error-code {
            font-size: 8rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 0;
        }
        .error-message {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .btn-home {
            background-color: #f5c842;
            border-color: #f5c842;
            color: #1e3d59;
            font-weight: bold;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }
        .btn-home:hover {
            background-color: #e6b139;
            color: #1e3d59;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .crown {
            animation: float 3s ease-in-out infinite;
            margin-bottom: 2rem;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="crown">
            <i class="fas fa-crown fa-4x"></i>
        </div>
        
        <h1 class="error-code">404</h1>
        <p class="error-message">Oops! The page you're looking for doesn't exist.</p>
        
        <div class="mb-4">
            <p>The page might have been moved, deleted, or you entered the wrong URL.</p>
        </div>
        
        <a href="/" class="btn-home">
            <i class="fas fa-home me-2"></i>
            Return Home
        </a>
        
        <div class="mt-4">
            <a href="/login" class="text-white text-decoration-none me-3">
                <i class="fas fa-sign-in-alt me-1"></i>Login
            </a>
            <a href="/contact" class="text-white text-decoration-none">
                <i class="fas fa-envelope me-1"></i>Contact Support
            </a>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>