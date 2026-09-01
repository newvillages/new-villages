-- Migration V8: Interac e-Transfer payment support and unique reference tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_number VARCHAR(64);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_name VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_email VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS community_name VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(32) DEFAULT 'INTERAC';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE payments ALTER COLUMN subscription_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN paid_at DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reference_number ON payments(reference_number) WHERE reference_number IS NOT NULL;
