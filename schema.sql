-- Smart Link Hub Database Schema
-- Compatible with PostgreSQL (Supabase, Railway, Neon)

-- 1. Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hubs (Containers for Links)
CREATE TABLE IF NOT EXISTS hubs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) DEFAULT 'My Smart Hub',
    description TEXT,
    theme VARCHAR(20) DEFAULT 'dark',
    unique_id VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Links (Individual Shortcuts)
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    hub_id INTEGER REFERENCES hubs(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 5,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Smart Rules (Conditional Routing)
CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    hub_id INTEGER REFERENCES hubs(id) ON DELETE CASCADE,
    name VARCHAR(100),
    rule_type VARCHAR(50), -- ('device', 'time', 'geo')
    rule_condition VARCHAR(100), -- (e.g., 'mobile', 'after=17:00')
    destination_url TEXT,
    priority INTEGER DEFAULT 5,
    operator VARCHAR(10) DEFAULT 'AND'
);

-- 5. Link Clicks (Forensic Analytics)
CREATE TABLE IF NOT EXISTS link_clicks (
    id SERIAL PRIMARY KEY,
    link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
