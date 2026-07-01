-- ============================================
-- Link Commerce Tables
-- Migration: 2026-06-30
-- ============================================

CREATE TABLE IF NOT EXISTS link_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255),
    whatsapp VARCHAR(50),
    journey_type VARCHAR(50),
    source VARCHAR(50),
    quiz_score INTEGER,
    quiz_answers JSONB,
    concierge_path JSONB,
    schedule_date DATE,
    schedule_time VARCHAR(10),
    schedule_service VARCHAR(100),
    schedule_message TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    visitor_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS link_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    element_id VARCHAR(100),
    metadata JSONB,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS link_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id VARCHAR(100),
    steps JSONB DEFAULT '[]',
    recommendation VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    lead_id UUID REFERENCES link_leads(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_link_events_created ON link_events(created_at DESC);
CREATE INDEX idx_link_events_element ON link_events(element_id, created_at DESC);
CREATE INDEX idx_link_leads_created ON link_leads(created_at DESC);
CREATE INDEX idx_link_leads_source ON link_leads(source);
