-- Seed demo users for EHS AI Platform
-- Password for all users: password123

-- Demo users with bcrypt-hashed passwords
INSERT INTO profiles (email, password_hash, full_name, role, department, site_name)
VALUES
    ('worker@demo.com', '$2b$12$pOmBhe8ZasZ7z6AqLD228e0A57cpdVjC5X/WXZU8GEUEUwC2S8ROu', 'John Worker', 'worker', 'Operations', 'Plant A'),
    ('supervisor@demo.com', '$2b$12$pOmBhe8ZasZ7z6AqLD228e0A57cpdVjC5X/WXZU8GEUEUwC2S8ROu', 'Jane Supervisor', 'supervisor', 'Operations', 'Plant A'),
    ('ehs@demo.com', '$2b$12$pOmBhe8ZasZ7z6AqLD228e0A57cpdVjC5X/WXZU8GEUEUwC2S8ROu', 'Bob EHS Officer', 'ehs_officer', 'EHS', 'Headquarters'),
    ('admin@demo.com', '$2b$12$pOmBhe8ZasZ7z6AqLD228e0A57cpdVjC5X/WXZU8GEUEUwC2S8ROu', 'Alice Admin', 'admin', 'IT', 'Headquarters')
ON CONFLICT (email) DO NOTHING;
