-- Sample subscription data for testing
INSERT OR IGNORE INTO subscriptions (name, description, cost, billing_cycle, billing_date, category, website_url, is_active) VALUES 
    ('Netflix', 'Video streaming service', 15.99, 'monthly', 15, 'Streaming', 'https://netflix.com', 1),
    ('Spotify Premium', 'Music streaming service', 9.99, 'monthly', 5, 'Music', 'https://spotify.com', 1),
    ('Adobe Creative Cloud', 'Design and creative software suite', 52.99, 'monthly', 1, 'Software', 'https://adobe.com', 1),
    ('GitHub Pro', 'Code repository hosting', 4.00, 'monthly', 10, 'Software', 'https://github.com', 1),
    ('Apple iCloud+', 'Cloud storage service', 2.99, 'monthly', 20, 'Cloud Storage', 'https://apple.com/icloud', 1),
    ('The New York Times', 'Digital newspaper subscription', 17.00, 'monthly', 25, 'News & Media', 'https://nytimes.com', 1),
    ('Planet Fitness', 'Gym membership', 24.99, 'monthly', 3, 'Fitness', 'https://planetfitness.com', 0),
    ('Disney+', 'Video streaming service', 7.99, 'monthly', 12, 'Streaming', 'https://disneyplus.com', 1),
    ('Dropbox Plus', 'Cloud storage and file sync', 11.99, 'monthly', 8, 'Cloud Storage', 'https://dropbox.com', 1),
    ('Microsoft 365', 'Productivity software suite', 6.99, 'monthly', 18, 'Productivity', 'https://microsoft.com/microsoft-365', 1);