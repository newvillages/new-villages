-- Migration V10: Add missing created_at and user_id columns to payments table for Hibernate schema validation
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE payments ALTER COLUMN subscription_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN paid_at DROP NOT NULL;
