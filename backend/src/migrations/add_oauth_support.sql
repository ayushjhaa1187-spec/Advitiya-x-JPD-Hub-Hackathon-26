-- Migration: Add OAuth Support to Users Table
-- Description: Adds oauth_provider and oauth_id columns to support Google/GitHub OAuth
-- Date: January 27, 2026

-- Add OAuth provider column (google, github, etc.)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);

-- Add OAuth ID from provider
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);

-- Make password nullable for OAuth users
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;

-- Add index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth 
ON users(oauth_provider, oauth_id);

-- Add short_code column to links table for URL shortening
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS short_code VARCHAR(20) UNIQUE;

-- Add index for short_code lookups
CREATE INDEX IF NOT EXISTS idx_links_short_code 
ON links(short_code);

-- Add QR code column to links table
ALTER TABLE links 
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Success message
SELECT 'OAuth support migration completed successfully!' as message;
