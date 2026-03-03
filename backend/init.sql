-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Diagnostic Quiz Leads
CREATE TABLE IF NOT EXISTS leads_quiz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    country_code VARCHAR(10) DEFAULT '+55',
    status VARCHAR(50) DEFAULT 'new'
);

-- Table for Priority List (Internationalization) Leads
CREATE TABLE IF NOT EXISTS leads_priority (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    country_code VARCHAR(10) DEFAULT '+55',
    status VARCHAR(50) DEFAULT 'new'
);

-- Table for Direct Contact Leads (Footer Form)
CREATE TABLE IF NOT EXISTS leads_contact (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50),
    service VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new'
);
