# ContabilJaque - Sistema de Controle de Clientes

Sistema completo para gestão de clientes de contabilidade, substituindo planilhas Excel por uma solução web moderna e segura.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Estado**: React Query, Context API, Zustand
- **Hooks Customizados**: Toda lógica de API encapsulada em hooks reutilizáveis
- **Deploy**: Docker, Vercel

## 📋 Funcionalidades

- ✅ **Gestão de Clientes**: CRUD completo com validação
- ✅ **Importação de Planilhas**: Excel/CSV com preview e validação
- ✅ **Exportação de Dados**: Excel, PDF, CSV
- ✅ **Documentos Fiscais**: Upload e gerenciamento
- ✅ **IRPF**: Controle de declarações
- ✅ **Autenticação**: Sistema seguro com Supabase Auth
- ✅ **Dashboard**: Visualização de estatísticas
- ✅ **Context API**: Gerenciamento de estado global
- ✅ **Hooks Customizados**: Toda API acessada via hooks

## 🏗️ Arquitetura

### Hooks Customizados

```typescript
// Exemplo de uso dos hooks
const { clients, loading, createClient } = useClients()
const { importing, importClients } = useImport()
const { exporting, exportToExcel } = useExport()
const { uploadDocument, downloadDocument } = useDocuments()
const { user, signIn, signOut } = useAuth()
```

### Context API

- **AuthContext**: Gerenciamento de autenticação
- **ClientContext**: Estado de clientes e filtros
- **AppContext**: Configurações globais (tema, idioma)
- **ToastContext**: Sistema de notificações

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Conta no Supabase (gratuito)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/contabiljaque-system.git
cd contabiljaque-system
```

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/contabiljaque?schema=public
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a URL e a chave anon do projeto
3. Configure as tabelas usando o schema em `prisma/schema.prisma`
4. Configure as políticas de segurança (RLS)

### 4. Inicie o ambiente com Docker

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Instalar dependências
npm install

# Gerar cliente Prisma
npm run db:generate

# Criar tabelas no banco
npm run db:push

# Iniciar aplicação
npm run dev
```

### 5. Acesse a aplicação

A aplicação estará disponível em: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Páginas principais
│   ├── login/            # Autenticação
│   └── layout.tsx        # Layout principal
├── components/           # Componentes reutilizáveis
│   └── ui/              # Componentes Shadcn/UI
├── contexts/            # Context API
│   ├── auth-context.tsx
│   ├── client-context.tsx
│   ├── app-context.tsx
│   └── toast-context.tsx
├── hooks/              # Hooks customizados
│   ├── use-clients.ts
│   ├── use-import.ts
│   ├── use-export.ts
│   ├── use-documents.ts
│   ├── use-auth.ts
│   └── use-toast.ts
├── lib/               # Utilitários
│   ├── supabase.ts
│   └── utils.ts
└── types/             # Tipos TypeScript
    ├── index.ts
    └── database.ts
```

## 🔧 Uso dos Hooks

### useClients - Gerenciamento de Clientes

```typescript
import { useClients } from '@/hooks/use-clients'

function ClientList() {
  const { 
    clients, 
    loading, 
    error, 
    createClient, 
    updateClient, 
    deleteClient,
    searchClients 
  } = useClients()

  // Uso
  const handleCreateClient = async (data) => {
    await createClient(data)
  }

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

### useImport - Importação de Planilhas

```typescript
import { useImport } from '@/hooks/use-import'

function ImportComponent() {
  const { importing, progress, importClients, previewData } = useImport()

  const handleFileUpload = async (file) => {
    await importClients(file)
  }

  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      {importing && <div>Progresso: {progress}%</div>}
      {previewData.map(preview => (
        <div key={preview.row}>
          {preview.errors.length > 0 && (
            <div>Erros: {preview.errors.join(', ')}</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

### useExport - Exportação de Dados

```typescript
import { useExport } from '@/hooks/use-export'

function ExportComponent() {
  const { exporting, exportToExcel, exportToPDF } = useExport()

  const handleExportExcel = async () => {
    await exportToExcel(clients)
  }

  const handleExportPDF = async () => {
    await exportToPDF(clients, 'relatorio-clientes')
  }

  return (
    <div>
      <button onClick={handleExportExcel} disabled={exporting}>
        Exportar Excel
      </button>
      <button onClick={handleExportPDF} disabled={exporting}>
        Exportar PDF
      </button>
    </div>
  )
}
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch
```

## 🚀 Deploy

### Docker Production

```bash
# Build da imagem Docker
docker build -t contabiljaque .

# Executar container
docker run -p 3000:3000 --env-file .env.local contabiljaque
```

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔒 Segurança

- Autenticação com Supabase Auth
- Políticas de segurança (RLS) no banco de dados
- Validação de dados em todos os formulários
- Sanitização de inputs
- Rate limiting nas APIs

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para: contabiljaque@example.com

---

Desenvolvido com ❤️ para facilitar o trabalho contábil