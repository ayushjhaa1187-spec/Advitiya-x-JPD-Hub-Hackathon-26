-- PostgreSQL Schema for Smart Link Hub
-- Advitiya x JPD Hub Hackathon 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LINK HUBS TABLE
CREATE TABLE link_hubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hub_slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(50) DEFAULT 'dark',
  total_visits INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LINKS TABLE
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES link_hubs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  description TEXT,
  click_count INT DEFAULT 0,
  priority INT DEFAULT 5,
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RULES TABLE (Smart Rule Engine)
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES link_hubs(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  condition TEXT NOT NULL,
  target_link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  priority INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  combination_operator VARCHAR(10) DEFAULT 'AND',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RULE CONDITIONS TABLE
CREATE TABLE rule_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL,
  condition_value VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANALYTICS TABLE
CREATE TABLE link_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES link_hubs(id) ON DELETE CASCADE,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,
  click_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent VARCHAR(2048),
  ip_address VARCHAR(45),
  referrer VARCHAR(2048),
  device_type VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100)
);

-- HUB VISITS TABLE
CREATE TABLE hub_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES link_hubs(id) ON DELETE CASCADE,
  visit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_agent VARCHAR(2048),
  ip_address VARCHAR(45),
  device_type VARCHAR(50),
  country VARCHAR(100)
);

-- URL SHORTCUTS TABLE
CREATE TABLE url_shortcuts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hub_id UUID NOT NULL REFERENCES link_hubs(id) ON DELETE CASCADE,
  original_url VARCHAR(2048) NOT NULL,
  short_code VARCHAR(100) UNIQUE NOT NULL,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_link_hubs_user_id ON link_hubs(user_id);
CREATE INDEX idx_link_hubs_slug ON link_hubs(hub_slug);
CREATE INDEX idx_links_hub_id ON links(hub_id);
CREATE INDEX idx_rules_hub_id ON rules(hub_id);
CREATE INDEX idx_link_analytics_hub_id ON link_analytics(hub_id);
CREATE INDEX idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX idx_link_analytics_timestamp ON link_analytics(click_timestamp);
CREATE INDEX idx_hub_visits_hub_id ON hub_visits(hub_id);
CREATE INDEX idx_url_shortcuts_hub_id ON url_shortcuts(hub_id);
