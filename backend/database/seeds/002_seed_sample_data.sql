-- Royal Ambassadors OGBC Portal - Sample Data
-- Seed: 002_seed_sample_data.sql
-- Updated with OGBC-specific sample data

-- Insert sample ambassadors (you can remove this in production)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, date_of_birth, gender, user_type, status, email_verified) VALUES
('tunde_adebayo', 'tunde.adebayo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tunde', 'Adebayo', '(234) 803-123-4567', '2008-05-15', 'male', 'ambassador', 'active', TRUE),
('segun_olumide', 'segun.olumide@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Segun', 'Olumide', '(234) 803-234-5678', '2009-03-22', 'male', 'ambassador', 'active', TRUE),
('kemi_johnson', 'kemi.johnson@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kemi', 'Johnson', '(234) 803-345-6789', '2007-11-08', 'male', 'ambassador', 'active', TRUE);

-- Insert ambassador profiles
INSERT INTO ambassadors (user_id, association_id, rank_id, membership_number, join_date, parent_name, parent_phone, parent_email, emergency_contact, emergency_phone, points) VALUES
((SELECT id FROM users WHERE username = 'tunde_adebayo'), 1, 1, 'OGBC001001', '2024-01-15', 'Mr. Adebayo Adebayo', '(234) 803-123-4560', 'adebayo.parent@example.com', 'Mrs. Adebayo Adebayo', '(234) 803-123-4561', 150),
((SELECT id FROM users WHERE username = 'segun_olumide'), 2, 3, 'OGBC002001', '2023-09-10', 'Mr. Olumide Olumide', '(234) 803-234-5670', 'olumide.parent@example.com', 'Mrs. Olumide Olumide', '(234) 803-234-5671', 280),
((SELECT id FROM users WHERE username = 'kemi_johnson'), 3, 5, 'OGBC003001', '2023-06-01', 'Mr. Johnson Johnson', '(234) 803-345-6780', 'johnson.parent@example.com', 'Mrs. Johnson Johnson', '(234) 803-345-6781', 420);

-- Insert sample camp registrations
INSERT INTO camp_registrations (ambassador_id, camp_name, camp_date, payment_status, payment_amount, special_requirements, emergency_contact, emergency_phone, status) VALUES
(1, 'OGBC Summer Leadership Camp 2024', '2024-07-15', 'paid', 15000.00, 'No dietary restrictions', 'Mrs. Adebayo Adebayo', '(234) 803-123-4561', 'confirmed'),
(2, 'OGBC Summer Leadership Camp 2024', '2024-07-15', 'paid', 15000.00, 'Vegetarian meals', 'Mrs. Olumide Olumide', '(234) 803-234-5671', 'confirmed'),
(1, 'OGBC Winter Retreat 2024', '2024-12-20', 'pending', 7500.00, 'None', 'Mrs. Adebayo Adebayo', '(234) 803-123-4561', 'registered');

-- Insert sample exam attempts
INSERT INTO exam_attempts (ambassador_id, exam_id, start_time, end_time, score, total_questions, correct_answers, status, passed, answers) VALUES
(2, 1, '2024-08-01 10:00:00', '2024-08-01 10:25:00', 80, 10, 8, 'completed', TRUE, '{"1":"A","2":"B","3":"C","4":"B","5":"C","6":"B","7":"B","8":"C","9":"B","10":"D"}'),
(3, 1, '2024-07-15 14:30:00', '2024-07-15 14:55:00', 90, 10, 9, 'completed', TRUE, '{"1":"A","2":"B","3":"C","4":"B","5":"C","6":"B","7":"B","8":"C","9":"B","10":"D"}');

-- Insert sample gallery items
INSERT INTO gallery (title, description, image_path, category, uploaded_by, association_id, status) VALUES
('OGBC Summer Camp 2024 - Group Photo', 'Royal Ambassadors from Agape Baptist Association at OGBC Summer Leadership Camp', '/images/GroupPhoto.jpg', 'camps', 1, 1, 'active'),
('Envoy Rank Ceremony', 'Kemi Johnson receiving his Envoy rank badge at Ketu Baptist Association', '/images/EnvoyCeremony.jpg', 'ceremonies', 2, 3, 'active'),
('Service Project - Community Outreach', 'Ambassadors from Abeokuta North West Baptist Association volunteering in community outreach', '/images/CommunityOutreach.jpg', 'service', 1, 2, 'active');

-- Insert sample notifications
INSERT INTO notifications (title, message, type, target_type, sender_id, status) VALUES
('Welcome to OGBC Portal', 'Welcome to the Royal Ambassadors Ogun Baptist Conference Portal! Please complete your profile and explore the available features across all 25 associations.', 'info', 'all', 1, 'sent'),
('OGBC Summer Camp Registration Open', 'Registration is now open for the 2024 OGBC Summer Leadership Camp. Early bird pricing available until May 1st. Camp fee: ₦15,000.', 'success', 'all', 1, 'sent'),
('Rank Advancement Reminder', 'Don''t forget to complete your rank advancement exam. Contact your association president if you need assistance with the 11-level progression system.', 'warning', 'association', 1, 'sent');

-- Insert user notifications for sample users
INSERT INTO user_notifications (user_id, notification_id) VALUES
((SELECT id FROM users WHERE username = 'tunde_adebayo'), 1),
((SELECT id FROM users WHERE username = 'tunde_adebayo'), 2),
((SELECT id FROM users WHERE username = 'tunde_adebayo'), 3),
((SELECT id FROM users WHERE username = 'segun_olumide'), 1),
((SELECT id FROM users WHERE username = 'segun_olumide'), 2),
((SELECT id FROM users WHERE username = 'kemi_johnson'), 1),
((SELECT id FROM users WHERE username = 'kemi_johnson'), 2);

-- Mark some notifications as read
UPDATE user_notifications SET read_at = NOW() WHERE user_id = (SELECT id FROM users WHERE username = 'segun_olumide') AND notification_id = 1;
UPDATE user_notifications SET read_at = NOW() WHERE user_id = (SELECT id FROM users WHERE username = 'kemi_johnson') AND notification_id = 1;

-- Insert sample login attempts (for testing security features)
INSERT INTO login_attempts (ip_address, username, success, attempted_at) VALUES
('192.168.1.100', 'tunde_adebayo', TRUE, NOW() - INTERVAL 1 DAY),
('192.168.1.101', 'segun_olumide', TRUE, NOW() - INTERVAL 2 HOURS),
('192.168.1.102', 'invalid_user', FALSE, NOW() - INTERVAL 30 MINUTES),
('192.168.1.100', 'tunde_adebayo', TRUE, NOW() - INTERVAL 1 HOUR);