-- Royal Ambassadors OGBC Portal - Updated Data Seeds
-- Seed: 001_seed_associations_and_ranks.sql
-- Updated with correct Ogun Baptist Conference data (25 Associations, 11 Ranks)

-- Clear existing data
DELETE FROM exam_questions WHERE exam_id IN (SELECT id FROM exams);
DELETE FROM exams;
DELETE FROM blog_posts;
DELETE FROM user_notifications;
DELETE FROM notifications;
DELETE FROM exam_attempts;
DELETE FROM ambassadors;
DELETE FROM associations;
DELETE FROM ranks;
DELETE FROM users WHERE user_type != 'super_admin';

-- Insert correct 11 ranks for OGBC
INSERT INTO ranks (name, level, description, requirements) VALUES
('Candidate', 1, 'Entry level rank for new Royal Ambassadors', 'Complete basic orientation and handbook study'),
('Assistant Intern', 2, 'Second level rank focusing on foundational skills', 'Complete 3 months as Candidate, pass basic exam, demonstrate commitment'),
('Intern', 3, 'Third level rank with increased responsibilities', 'Complete 6 months as Assistant Intern, pass written exam, complete service project'),
('Senior Intern', 4, 'Advanced intern level with leadership opportunities', 'Complete 9 months as Intern, demonstrate leadership skills, mentor newer members'),
('Envoy', 5, 'Representative level with significant responsibilities', 'Complete 12 months as Senior Intern, pass comprehensive exam, lead projects'),
('Senior Envoy', 6, 'Advanced envoy level with expanded duties', 'Complete 15 months as Envoy, demonstrate exceptional service, train others'),
('Special Envoy', 7, 'Specialized role with unique responsibilities', 'Complete 18 months as Senior Envoy, complete special assignments, show expertise'),
('Dean', 8, 'Leadership role overseeing multiple activities', 'Complete 21 months as Special Envoy, demonstrate administrative skills, lead teams'),
('Ambassador', 9, 'Senior leadership role representing the association', 'Complete 24 months as Dean, pass advanced exam, show exceptional leadership'),
('Ambassador Extraordinary', 10, 'Distinguished rank for outstanding service', 'Complete 30 months as Ambassador, nominated by leadership, exceptional achievements'),
('Ambassador Plenipotentiary', 11, 'Highest rank with full authority and responsibility', 'Complete 36 months as Ambassador Extraordinary, demonstrate mastery, serve as role model');

-- Insert correct 25 associations for Ogun Baptist Conference
INSERT INTO associations (name, code, region, state, address, phone, email, status) VALUES
('Agape Baptist Association', 'ABA001', 'Central', 'Ogun', 'Agape Baptist Church Complex, Abeokuta, Ogun State', '(234) 803-000-0001', 'info@agape-ba.org', 'active'),
('Abeokuta North West Baptist Association', 'ANWBA002', 'North West', 'Ogun', 'North West Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0002', 'contact@anwba.org', 'active'),
('Ketu Baptist Association', 'KBA003', 'South West', 'Ogun', 'Ketu Baptist Church, Ketu, Ogun State', '(234) 803-000-0003', 'admin@ketu-ba.org', 'active'),
('Irepodun Oke-Yewa Baptist Association', 'IOYBA004', 'North', 'Ogun', 'Irepodun Baptist Centre, Oke-Yewa, Ogun State', '(234) 803-000-0004', 'office@ioyba.org', 'active'),
('Zion Baptist Association', 'ZBA005', 'Central', 'Ogun', 'Zion Baptist Church Complex, Abeokuta, Ogun State', '(234) 803-000-0005', 'info@zion-ba.org', 'active'),
('Abeokuta South Baptist Association', 'ASBA006', 'South', 'Ogun', 'South Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0006', 'contact@asba.org', 'active'),
('Ijebu North East Baptist Association', 'INEBA007', 'North East', 'Ogun', 'Ijebu North East Baptist Centre, Ijebu-Ode, Ogun State', '(234) 803-000-0007', 'admin@ineba.org', 'active'),
('Great Grace Baptist Association', 'GGBA008', 'Central', 'Ogun', 'Great Grace Baptist Church, Abeokuta, Ogun State', '(234) 803-000-0008', 'office@ggba.org', 'active'),
('Abeokuta East Baptist Association', 'AEBA009', 'East', 'Ogun', 'East Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0009', 'info@aeba.org', 'active'),
('Upper Room Baptist Association', 'URBA010', 'Central', 'Ogun', 'Upper Room Baptist Church, Abeokuta, Ogun State', '(234) 803-000-0010', 'contact@urba.org', 'active'),
('Ijebu North Baptist Association', 'INBA011', 'North', 'Ogun', 'Ijebu North Baptist Centre, Ijebu-Igbo, Ogun State', '(234) 803-000-0011', 'admin@inba.org', 'active'),
('Abeokuta North-East Baptist Association', 'ANEBA012', 'North East', 'Ogun', 'North-East Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0012', 'office@aneba.org', 'active'),
('Abeokuta West Baptist Association', 'AWBA013', 'West', 'Ogun', 'West Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0013', 'info@awba.org', 'active'),
('Bethel Baptist Association', 'BBA014', 'Central', 'Ogun', 'Bethel Baptist Church Complex, Abeokuta, Ogun State', '(234) 803-000-0014', 'contact@bethel-ba.org', 'active'),
('Ayetoro Baptist Association', 'ABA015', 'North', 'Ogun', 'Ayetoro Baptist Centre, Ayetoro, Ogun State', '(234) 803-000-0015', 'admin@ayetoro-ba.org', 'active'),
('Dominion Baptist Association', 'DBA016', 'Central', 'Ogun', 'Dominion Baptist Church, Abeokuta, Ogun State', '(234) 803-000-0016', 'office@dominion-ba.org', 'active'),
('Iroyin Ayo Baptist Association', 'IABA017', 'South', 'Ogun', 'Iroyin Ayo Baptist Centre, Sagamu, Ogun State', '(234) 803-000-0017', 'info@iaba.org', 'active'),
('Ijebu Central Baptist Association', 'ICBA018', 'Central', 'Ogun', 'Ijebu Central Baptist Centre, Ijebu-Ode, Ogun State', '(234) 803-000-0018', 'contact@icba.org', 'active'),
('Rehoboth Baptist Association', 'RBA019', 'Central', 'Ogun', 'Rehoboth Baptist Church, Abeokuta, Ogun State', '(234) 803-000-0019', 'admin@rehoboth-ba.org', 'active'),
('Christlife Baptist Association', 'CBA020', 'South', 'Ogun', 'Christlife Baptist Centre, Sagamu, Ogun State', '(234) 803-000-0020', 'office@christlife-ba.org', 'active'),
('Ifeoluwa Baptist Association', 'IBA021', 'Central', 'Ogun', 'Ifeoluwa Baptist Church, Abeokuta, Ogun State', '(234) 803-000-0021', 'info@ifeoluwa-ba.org', 'active'),
('Ijebu Progressive Baptist Association', 'IPBA022', 'South East', 'Ogun', 'Ijebu Progressive Baptist Centre, Ijebu-Ode, Ogun State', '(234) 803-000-0022', 'contact@ipba.org', 'active'),
('Yewa Baptist Association', 'YBA023', 'West', 'Ogun', 'Yewa Baptist Centre, Ilaro, Ogun State', '(234) 803-000-0023', 'admin@yewa-ba.org', 'active'),
('Ayooluwa Baptist Association', 'ABA024', 'South', 'Ogun', 'Ayooluwa Baptist Centre, Ijebu-Ode, Ogun State', '(234) 803-000-0024', 'office@ayooluwa-ba.org', 'active'),
('Macedonia Baptist Association', 'MBA025', 'North West', 'Ogun', 'Macedonia Baptist Centre, Abeokuta, Ogun State', '(234) 803-000-0025', 'info@macedonia-ba.org', 'active');

-- Create default super admin user (password: 'AdminPass123!')
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, status, email_verified) VALUES
('superadmin', 'admin@ra-ogbc.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Administrator', 'super_admin', 'active', TRUE);

-- Create sample association presidents for first few associations
INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, status, email_verified) VALUES
('president_agape', 'president@agape-ba.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pastor', 'Adebayo', 'president', 'active', TRUE),
('president_anwba', 'president@anwba.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pastor', 'Olumide', 'president', 'active', TRUE),
('president_ketu', 'president@ketu-ba.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pastor', 'Kehinde', 'president', 'active', TRUE);

-- Update associations with president IDs
UPDATE associations SET president_id = (SELECT id FROM users WHERE username = 'president_agape') WHERE code = 'ABA001';
UPDATE associations SET president_id = (SELECT id FROM users WHERE username = 'president_anwba') WHERE code = 'ANWBA002';
UPDATE associations SET president_id = (SELECT id FROM users WHERE username = 'president_ketu') WHERE code = 'KBA003';

-- Insert updated blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category, status, published_at) VALUES
('Welcome to Royal Ambassadors OGBC Portal', 'welcome-to-ra-ogbc-portal', 
'<p>Welcome to the official Royal Ambassadors Ogun Baptist Conference Portal! This platform is designed to help our young men grow in their faith, develop leadership skills, and connect with their local associations across Ogun State.</p><p>Here you can register for camps, take advancement exams, view your progress, and stay connected with the Royal Ambassadors community in all 25 associations of OGBC.</p>', 
'Welcome to the official Royal Ambassadors OGBC Portal - your gateway to faith, leadership, and community across all 25 associations in Ogun State.',
1, 'announcements', 'published', NOW()),

('Understanding the OGBC 11-Level Rank System', 'understanding-ogbc-rank-system',
'<p>The Royal Ambassadors OGBC program uses an 11-level progressive rank system to help young men develop spiritually and as leaders. Starting as a Candidate, ambassadors advance through: Assistant Intern, Intern, Senior Intern, Envoy, Senior Envoy, Special Envoy, Dean, Ambassador, Ambassador Extraordinary, and finally Ambassador Plenipotentiary.</p><p>Each rank has specific requirements including study, service, and leadership components. This comprehensive system ensures steady growth and development in Christian character and leadership abilities across all 25 OGBC associations.</p>',
'Learn about the Royal Ambassadors OGBC 11-level rank advancement system and how to progress through each level.',
1, 'education', 'published', NOW());

-- Create sample exam for Candidate rank
INSERT INTO exams (title, description, rank_id, total_questions, passing_score, time_limit, status, created_by) VALUES
('Candidate Rank Advancement Exam', 'Basic knowledge exam covering Royal Ambassadors handbook, Christian principles, and OGBC program basics for all 25 associations.', 1, 10, 70, 30, 'active', 1);

-- Insert sample exam questions for Candidate rank
INSERT INTO exam_questions (exam_id, question, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
(1, 'What is the motto of Royal Ambassadors?', 'We are Ambassadors for Christ', 'Faith, Hope, and Love', 'Serve the King', 'Christian Leadership', 'A', 1),
(1, 'What does OGBC stand for?', 'Ogun General Baptist Conference', 'Ogun Baptist Conference', 'Ogun Great Baptist Conference', 'Ogun Gospel Baptist Conference', 'B', 2),
(1, 'How many associations are in OGBC?', '20', '23', '25', '30', 'C', 3),
(1, 'What is the first rank in Royal Ambassadors OGBC?', 'Assistant Intern', 'Candidate', 'Intern', 'Envoy', 'B', 4),
(1, 'What is the highest rank in Royal Ambassadors OGBC?', 'Ambassador', 'Ambassador Extraordinary', 'Ambassador Plenipotentiary', 'Special Envoy', 'C', 5),
(1, 'How many ranks are in the OGBC system?', '9', '10', '11', '12', 'C', 6),
(1, 'What rank comes after Senior Intern?', 'Envoy', 'Special Envoy', 'Dean', 'Ambassador', 'A', 7),
(1, 'In which state is OGBC located?', 'Lagos', 'Oyo', 'Ogun', 'Osun', 'C', 8),
(1, 'What is the primary purpose of Royal Ambassadors?', 'Sports and recreation', 'Developing Christian men and leaders', 'Academic achievement', 'Community service', 'B', 9),
(1, 'Which rank comes before Ambassador Extraordinary?', 'Dean', 'Ambassador', 'Special Envoy', 'Senior Envoy', 'B', 10);

-- Update exam total questions
UPDATE exams SET total_questions = (SELECT COUNT(*) FROM exam_questions WHERE exam_id = 1) WHERE id = 1;