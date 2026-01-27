-- Create Smart Rules Table for Link Hub
-- Supports: Device, Time, Location, Click-Performance Rules

CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rule Metadata
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,  -- Higher priority rules evaluated first
    
    -- Rule Type: device, time, location, clicks, combined
    rule_type VARCHAR(50) NOT NULL,
    
    -- Rule Conditions (JSON)
    -- For device: {"deviceTypes": ["mobile", "desktop", "tablet"]}
    -- For time: {"days": ["mon", "tue"], "startTime": "09:00", "endTime": "17:00", "timezone": "Asia/Kolkata"}
    -- For location: {"countries": ["IN", "US"], "regions": ["Delhi", "California"]}
    -- For clicks: {"minClicks": 100, "period": "7days"}
    conditions JSONB NOT NULL,
    
    -- Rule Actions (JSON)
    -- {"action": "redirect", "targetUrl": "https://example.com"}
    -- {"action": "prioritize", "weight": 10}
    -- {"action": "show", "visibility": true}
    -- {"action": "hide", "visibility": false}
    actions JSONB NOT NULL,
    
    -- Analytics
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_rule_type CHECK (rule_type IN ('device', 'time', 'location', 'clicks', 'combined'))
);

-- Indexes for performance
CREATE INDEX idx_rules_link_id ON rules(link_id);
CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_enabled ON rules(is_enabled);
CREATE INDEX idx_rules_type ON rules(rule_type);
CREATE INDEX idx_rules_priority ON rules(priority DESC);
CREATE INDEX idx_rules_conditions ON rules USING GIN (conditions);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rules_timestamp
BEFORE UPDATE ON rules
FOR EACH ROW
EXECUTE FUNCTION update_rules_updated_at();

-- Sample rules data for testing
INSERT INTO rules (link_id, user_id, name, description, rule_type, conditions, actions, is_enabled, priority)
VALUES 
-- Device-based rule
(1, 1, 'Mobile App Store Redirect', 'Redirect mobile users to app store', 'device', 
 '{"deviceTypes": ["mobile"]}',
 '{"action": "redirect", "targetUrl": "https://play.google.com/store"}',
true, 10),

-- Time-based rule
(1, 1, 'Business Hours Priority', 'Show work-related links during business hours', 'time',
 '{"days": ["mon", "tue", "wed", "thu", "fri"], "startTime": "09:00", "endTime": "18:00", "timezone": "Asia/Kolkata"}',
 '{"action": "prioritize", "weight": 15}',
true, 8),

-- Location-based rule
(1, 1, 'India Regional Content', 'Show India-specific content', 'location',
 '{"countries": ["IN"], "regions": ["Delhi", "Mumbai", "Bangalore"]}',
 '{"action": "show", "visibility": true}',
true, 7),

-- Click-performance rule
(1, 1, 'Popular Link Promotion', 'Auto-promote links with >100 clicks', 'clicks',
 '{"minClicks": 100, "period": "7days"}',
 '{"action": "prioritize", "weight": 20}',
true, 9);

COMMENT ON TABLE rules IS 'Smart routing rules for dynamic link behavior';
COMMENT ON COLUMN rules.rule_type IS 'Type of rule: device, time, location, clicks, or combined';
COMMENT ON COLUMN rules.conditions IS 'JSON object containing rule conditions';
COMMENT ON COLUMN rules.actions IS 'JSON object containing actions to execute when rule matches';
COMMENT ON COLUMN rules.priority IS 'Rule execution priority (higher = evaluated first)';
