-- ===================================================
-- Schema do CRM para bot de atendimento WhatsApp
-- ===================================================

CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,        -- formato: 5511999999999
    name VARCHAR(160),
    tags TEXT[] DEFAULT '{}',
    first_contact_at TIMESTAMP DEFAULT NOW(),
    last_contact_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    message TEXT NOT NULL,
    intent VARCHAR(30),                        -- 'support' | 'sales' | 'scheduling' | 'other'
    handled_by VARCHAR(10) DEFAULT 'bot' CHECK (handled_by IN ('bot', 'human')),
    agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'novo' CHECK (status IN ('novo', 'qualificando', 'orcamento', 'fechado', 'perdido')),
    estimated_value NUMERIC(10,2),
    source VARCHAR(60) DEFAULT 'whatsapp',
    agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    status VARCHAR(20) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta')),
    agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    service VARCHAR(160),
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'cancelado', 'concluido')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fila de escalonamento humano
CREATE TABLE escalation_queue (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'finalizado')),
    agent_id INTEGER REFERENCES agents(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_escalation_status ON escalation_queue(status);
