<?php $this->section('content'); ?>
<div class="row justify-content-center mt-5">
    <div class="col-md-6 col-lg-4">
        <div class="card shadow">
            <div class="card-body p-4">
                <div class="text-center mb-4">
                    <i class="fas fa-crown fa-3x text-primary mb-3"></i>
                    <h3 class="card-title">Sign In</h3>
                    <p class="text-muted">Welcome back to Royal Ambassadors OGBC</p>
                </div>
                
                <?php if (isset($security_error)): ?>
                    <div class="alert alert-danger">
                        <i class="fas fa-shield-alt me-2"></i>
                        Security error detected. Please login again.
                    </div>
                <?php endif; ?>
                
                <?php if (isset($timeout)): ?>
                    <div class="alert alert-warning">
                        <i class="fas fa-clock me-2"></i>
                        Your session has expired. Please login again.
                    </div>
                <?php endif; ?>
                
                <form method="POST" action="/login" id="loginForm">
                    <?= $this->csrfField() ?>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            <i class="fas fa-envelope me-1"></i>
                            Email Address
                        </label>
                        <input type="email" class="form-control" id="email" name="email" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="password" class="form-label">
                            <i class="fas fa-lock me-1"></i>
                            Password
                        </label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="password" name="password" required>
                            <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="remember_me" name="remember_me">
                            <label class="form-check-label" for="remember_me">
                                Remember me
                            </label>
                        </div>
                    </div>
                    
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Sign In
                        </button>
                    </div>
                </form>
                
                <div class="text-center mt-3">
                    <a href="/forgot-password" class="text-decoration-none">
                        <i class="fas fa-question-circle me-1"></i>
                        Forgot your password?
                    </a>
                </div>
                
                <hr>
                
                <div class="text-center">
                    <p class="mb-0">Don't have an account?</p>
                    <a href="/register" class="btn btn-outline-primary">
                        <i class="fas fa-user-plus me-2"></i>
                        Create Account
                    </a>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-3">
            <small class="text-muted">
                <i class="fas fa-shield-alt me-1"></i>
                Your connection is secure and encrypted
            </small>
        </div>
    </div>
</div>
<?php $this->endSection(); ?>

<?php $this->section('scripts'); ?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // Form validation
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', function(e) {
        const email = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        
        if (!email || !passwordValue) {
            e.preventDefault();
            alert('Please fill in all required fields.');
            return false;
        }
        
        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
    });
});
</script>
<?php $this->endSection(); ?>

<?php $this->extend('layouts.app', ['title' => $title ?? 'Login']); ?>