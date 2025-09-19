-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    cost REAL NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    billing_date INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories for organizing subscriptions
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, color) VALUES 
    ('Streaming', '#EF4444'),
    ('Software', '#3B82F6'), 
    ('Fitness', '#10B981'),
    ('News & Media', '#F59E0B'),
    ('Cloud Storage', '#8B5CF6'),
    ('Music', '#EC4899'),
    ('Gaming', '#06B6D4'),
    ('Productivity', '#84CC16'),
    ('Other', '#6B7280');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_date ON subscriptions(billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_cycle ON subscriptions(billing_cycle);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_subscriptions_updated_at 
    AFTER UPDATE ON subscriptions
BEGIN
    UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;