<?php $this->section('content'); ?>
<div class="hero-section py-5 mb-5" style="background: linear-gradient(135deg, #1e3d59 0%, #17a2b8 100%); color: white;">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <h1 class="display-4 fw-bold mb-4">
                    <i class="fas fa-crown me-3"></i>
                    Royal Ambassadors OGBC
                </h1>
                <p class="lead mb-4">
                    Empowering young leaders in Christ through faith, fellowship, and service. 
                    Join our community of dedicated ambassadors committed to spiritual growth and excellence.
                </p>
                
                <?php if (!$this->auth()): ?>
                    <div class="d-flex gap-3">
                        <a href="/register" class="btn btn-warning btn-lg">
                            <i class="fas fa-user-plus me-2"></i>
                            Join Us Today
                        </a>
                        <a href="/login" class="btn btn-outline-light btn-lg">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Sign In
                        </a>
                    </div>
                <?php else: ?>
                    <a href="/dashboard" class="btn btn-warning btn-lg">
                        <i class="fas fa-tachometer-alt me-2"></i>
                        Go to Dashboard
                    </a>
                <?php endif; ?>
            </div>
            <div class="col-lg-6">
                <div class="text-center">
                    <i class="fas fa-users fa-8x opacity-75"></i>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="container">
    <!-- Features Section -->
    <div class="row mb-5">
        <div class="col-12">
            <h2 class="text-center mb-5">What We Offer</h2>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
                <div class="card-body">
                    <i class="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                    <h5 class="card-title">Rank Advancement</h5>
                    <p class="card-text">
                        Progress through 11 official Royal Ambassador ranks, from Page to Duchess, 
                        through dedicated study and service.
                    </p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
                <div class="card-body">
                    <i class="fas fa-book-open fa-3x text-success mb-3"></i>
                    <h5 class="card-title">Online Exams</h5>
                    <p class="card-text">
                        Take comprehensive exams online to test your knowledge and advance 
                        to the next rank in your Royal Ambassador journey.
                    </p>
                </div>
            </div>
        </div>
        
        <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
                <div class="card-body">
                    <i class="fas fa-campground fa-3x text-info mb-3"></i>
                    <h5 class="card-title">Camp Registration</h5>
                    <p class="card-text">
                        Register for exciting camps and events designed to strengthen 
                        fellowship and deepen your faith journey.
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Ranks Overview -->
    <div class="row mb-5">
        <div class="col-12">
            <h2 class="text-center mb-4">Royal Ambassador Ranks</h2>
            <div class="row">
                <?php 
                $ranks = RA_RANKS;
                $rankColors = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
                $colorIndex = 0;
                ?>
                
                <?php foreach (array_chunk($ranks, 6, true) as $rankGroup): ?>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <?php foreach ($rankGroup as $id => $rank): ?>
                                    <div class="d-flex align-items-center mb-2">
                                        <span class="badge bg-<?= $rankColors[$colorIndex % count($rankColors)] ?> me-3">
                                            <?= $id ?>
                                        </span>
                                        <span><?= $this->e($rank) ?></span>
                                    </div>
                                    <?php $colorIndex++; ?>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    
    <!-- Associations -->
    <div class="row mb-5">
        <div class="col-12">
            <h2 class="text-center mb-4">Our Partner Associations</h2>
            <p class="text-center mb-4">We work with <?= count(ASSOCIATIONS) ?> official associations across the region</p>
            
            <div class="row">
                <?php foreach (array_chunk(ASSOCIATIONS, ceil(count(ASSOCIATIONS) / 3)) as $associationGroup): ?>
                    <div class="col-md-4">
                        <ul class="list-group">
                            <?php foreach ($associationGroup as $association): ?>
                                <li class="list-group-item">
                                    <i class="fas fa-church me-2 text-primary"></i>
                                    <?= $this->e($association) ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>
<?php $this->endSection(); ?>

<?php $this->extend('layouts.app', ['title' => $title ?? 'Home']); ?>