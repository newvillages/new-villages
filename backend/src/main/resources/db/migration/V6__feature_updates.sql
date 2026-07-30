-- Migration V6: Feature Updates & Enhancements

-- 1. Custom Community Terms
ALTER TABLE communities ADD COLUMN custom_terms text;

-- 2. Community Categories
CREATE TABLE community_categories (
    id uuid PRIMARY KEY,
    name varchar(100) NOT NULL,
    description text,
    icon_name varchar(60),
    created_at timestamptz NOT NULL,
    CONSTRAINT uq_community_categories_name UNIQUE (name)
);

-- Seed initial default categories
INSERT INTO community_categories (id, name, description, icon_name, created_at) VALUES
('a1000000-0000-0000-0000-000000000001', 'Culture & Heritage', 'Cultural groups, heritage networks, language exchange and regional traditions.', 'Globe', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000002', 'Tech & Innovation', 'Developers, tech founders, digital skills and innovation circles.', 'Code', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000003', 'Sports & Wellness', 'Fitness clubs, outdoor activities, yoga and sports teams.', 'Activity', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000004', 'Arts & Entertainment', 'Music, creative arts, drama, photography and entertainment.', 'Film', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000005', 'Parents & Families', 'Parenting support, child activities, playgroups and family gatherings.', 'Users', CURRENT_TIMESTAMP),
('a1000000-0000-0000-0000-000000000006', 'Local Support', 'Neighborhood support, community help, food sharing and volunteering.', 'Heart', CURRENT_TIMESTAMP);

-- 3. Dynamic Subscription Pricing Tariffs
CREATE TABLE pricing_plans (
    id uuid PRIMARY KEY,
    code varchar(50) NOT NULL,
    name varchar(120) NOT NULL,
    price numeric(10, 2) NOT NULL,
    currency varchar(10) NOT NULL DEFAULT 'CAD',
    billing_period varchar(30) NOT NULL DEFAULT 'monthly',
    tag varchar(100),
    description text,
    features text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CONSTRAINT uq_pricing_plans_code UNIQUE (code)
);

-- Seed initial pricing plans
INSERT INTO pricing_plans (id, code, name, price, currency, billing_period, tag, description, features, is_active, created_at, updated_at) VALUES
('b2000000-0000-0000-0000-000000000001', 'free', 'Member', 0.00, 'CAD', 'monthly', 'Join and connect', 'Free access for all members', 'Unlimited communities|RSVP to events|Direct messages|Notifications', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2000000-0000-0000-0000-000000000002', 'leader', 'Community Leader', 10.00, 'CAD', 'monthly', 'Most popular', 'For circle leaders and community builders', 'All Member features|Create & manage a community|Publish announcements & events|Basic analytics', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2000000-0000-0000-0000-000000000003', 'org', 'Organization', 20.00, 'CAD', 'monthly', 'For businesses & nonprofits', 'For organizations offering services to communities', 'All Leader features|Verified org page|Contact communities directly|Team seats', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Refund Requests
CREATE TABLE refund_requests (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    subscription_id uuid REFERENCES subscriptions (id) ON DELETE CASCADE,
    amount numeric(10, 2),
    reason varchar(255) NOT NULL,
    details text,
    status varchar(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by uuid REFERENCES users (id),
    reviewed_at timestamptz,
    created_at timestamptz NOT NULL
);
CREATE INDEX idx_refund_requests_user ON refund_requests (user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests (status);
