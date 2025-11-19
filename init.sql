-- Criar tabelas principais
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT,
    role VARCHAR(50) DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    tipo_guia VARCHAR(100),
    regularizacao VARCHAR(255),
    situacao VARCHAR(255),
    reference_month VARCHAR(7), -- YYYY-MM format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS annual_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(100),
    observation TEXT,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS irpf_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    sequence_number INTEGER,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_cpf_cnpj ON clients(cpf_cnpj);

CREATE INDEX IF NOT EXISTS idx_monthly_services_client_id ON monthly_services(client_id);
CREATE INDEX IF NOT EXISTS idx_annual_services_client_id ON annual_services(client_id);
CREATE INDEX IF NOT EXISTS idx_irpf_entries_client_id ON irpf_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_irpf_entries_cpf ON irpf_entries(cpf);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

-- Configurar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE irpf_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários autenticados
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para clientes
CREATE POLICY "Usuários podem ver seus próprios clientes" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar clientes" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para serviços mensais
CREATE POLICY "Usuários podem ver serviços de seus clientes" ON monthly_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = monthly_services.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar serviços para seus clientes" ON monthly_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = monthly_services.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- Políticas para serviços anuais
CREATE POLICY "Usuários podem ver serviços anuais de seus clientes" ON annual_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = annual_services.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar serviços anuais para seus clientes" ON annual_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = annual_services.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- Políticas para IRPF
CREATE POLICY "Usuários podem ver entradas IRPF de seus clientes" ON irpf_entries
    FOR SELECT USING (
        client_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = irpf_entries.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar entradas IRPF" ON irpf_entries
    FOR INSERT WITH CHECK (true);

-- Políticas para documentos
CREATE POLICY "Usuários podem ver documentos de seus clientes" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = documents.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar documentos para seus clientes" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = documents.client_id 
            AND clients.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem deletar documentos de seus clientes" ON documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clients 
            WHERE clients.id = documents.client_id 
            AND clients.user_id = auth.uid()
        )
    );

-- Conceder permissões
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

GRANT SELECT ON clients TO anon;
GRANT ALL PRIVILEGES ON clients TO authenticated;

GRANT SELECT ON monthly_services TO anon;
GRANT ALL PRIVILEGES ON monthly_services TO authenticated;

GRANT SELECT ON annual_services TO anon;
GRANT ALL PRIVILEGES ON annual_services TO authenticated;

GRANT SELECT ON irpf_entries TO anon;
GRANT ALL PRIVILEGES ON irpf_entries TO authenticated;

GRANT SELECT ON documents TO anon;
GRANT ALL PRIVILEGES ON documents TO authenticated;

-- Criar usuário admin padrão (senha: admin123)
INSERT INTO users (id, email, name, role) VALUES 
('00000000-0000-0000-0000-000000000000', 'admin@contabiljaque.com', 'Administrador', 'ADMIN')
ON CONFLICT (id) DO NOTHING;
-- Ajustar coluna de senha quando tabela já existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;