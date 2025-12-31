#!/bin/bash

# Royal Ambassadors Portal - Deployment Setup Script
# This script prepares the application for production deployment

set -e  # Exit on any error

echo "🚀 Royal Ambassadors Portal - Deployment Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (not recommended for production)
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a dedicated user for security."
fi

# 1. Environment Setup
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status "Created .env from .env.example"
        print_warning "Please update .env with your production values before continuing!"
    else
        print_error ".env.example not found. Please create environment configuration."
        exit 1
    fi
else
    print_status ".env file already exists"
fi

# 2. Directory Structure
print_status "Creating required directories..."
mkdir -p storage/logs
mkdir -p storage/cache
mkdir -p secure_uploads
mkdir -p uploads
mkdir -p tmp

# 3. Set proper permissions
print_status "Setting file permissions..."
chmod 755 storage storage/logs storage/cache secure_uploads uploads tmp
chmod 644 .env 2>/dev/null || print_warning "Could not set .env permissions to 644"
chmod 755 scripts/*.sh 2>/dev/null || print_warning "Could not set script permissions"

# Create .gitkeep files for empty directories
touch storage/logs/.gitkeep
touch storage/cache/.gitkeep
touch secure_uploads/.gitkeep
touch uploads/.gitkeep
touch tmp/.gitkeep

# 4. Install PHP dependencies (if Composer is available)
if command -v composer &> /dev/null; then
    print_status "Installing PHP dependencies..."
    composer install --no-dev --optimize-autoloader
else
    print_warning "Composer not found. Please install PHP dependencies manually."
fi

# 5. Install Node.js dependencies (if npm is available)
if command -v npm &> /dev/null; then
    print_status "Installing Node.js dependencies..."
    npm install --production
    npm run build 2>/dev/null || print_warning "Could not build frontend assets"
else
    print_warning "npm not found. Frontend dependencies not installed."
fi

# 6. Database setup check
print_status "Checking database configuration..."
php -r "
require_once 'config/config.php';
try {
    \$pdo = new PDO(
        'mysql:host=' . \$_ENV['DB_HOST'] . ';dbname=' . \$_ENV['DB_NAME'],
        \$_ENV['DB_USERNAME'],
        \$_ENV['DB_PASSWORD']
    );
    echo 'Database connection successful\n';
} catch (PDOException \$e) {
    echo 'Database connection failed: ' . \$e->getMessage() . '\n';
    exit(1);
}
"

# 7. Security hardening
print_status "Applying security hardening..."

# Create secure .htaccess for uploads if not exists
if [ ! -f secure_uploads/.htaccess ]; then
    cat > secure_uploads/.htaccess << 'EOF'
# Disable PHP execution in upload directory
php_flag engine off

# Deny access to all files by default
<Files "*">
    Order Deny,Allow
    Deny from all
</Files>

# Allow only specific file types
<FilesMatch "\.(jpg|jpeg|png|gif|pdf|doc|docx)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
EOF
    print_status "Created secure .htaccess for uploads directory"
fi

# 8. Run security check
print_status "Running security check..."
if [ -f scripts/security_check.php ]; then
    php scripts/security_check.php
else
    print_warning "Security check script not found"
fi

# 9. Create deployment info file
cat > deployment_info.txt << EOF
Royal Ambassadors Portal - Deployment Information
================================================

Deployment Date: $(date)
PHP Version: $(php -v | head -n1)
Web Server: Apache (assumed)

Required PHP Extensions:
- PDO
- PDO MySQL
- Session
- JSON
- mbstring
- OpenSSL
- cURL
- GD
- Fileinfo

Post-Deployment Checklist:
□ Update .env with production values
□ Configure SSL certificate
□ Set up database (run setup_database_fixed.php)
□ Test user registration/login
□ Verify file upload functionality
□ Configure email settings
□ Set up backup system
□ Configure monitoring
□ Perform security scan

Support:
- Check logs in storage/logs/
- Run security check: php scripts/security_check.php
- Database setup: php setup_database_fixed.php
EOF

print_status "Deployment setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env with your production values"
echo "2. Configure your web server to point to this directory"
echo "3. Set up SSL certificate"
echo "4. Run: php setup_database_fixed.php"
echo "5. Test the application"
echo ""
echo "📄 See deployment_info.txt for detailed checklist"