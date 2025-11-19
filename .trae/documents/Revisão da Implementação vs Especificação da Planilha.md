## Lacunas Identificadas
- **API Routes ausentes**: Não existe `src/pages/api/*` nem uso de `NextApiRequest/NextApiResponse`.
- **Prisma sem uso no runtime**: Há `prisma/schema.prisma`, mas falta o cliente Prisma (`src/lib/prisma.ts`) e rotas que o utilizem.
- **Autenticação**: Contexto baseado em Supabase; a especificação sugere proteção e autenticação própria. Você pediu remover Supabase — falta auth local (login, logout, sessão).
- **Importação/Exportação via API**: `use-import` e `use-export` funcionam no cliente e usam Supabase; a especificação sugere endpoint `/api/import/xlsx` e exportações controladas no servidor.
- **Validações CPF/CNPJ**: Implementação atual é simplificada (apenas tamanho). A especificação recomenda validação com dígito verificador.
- **Next 16.0.3**: Projeto roda Next 14.0.4; falta atualização de dependências conforme documentação atual dos API Routes.
- **Armazenamento de documentos**: Uso de Supabase Storage; com migração para PostgreSQL puro, falta definir upload/download via API ou filesystem.
- **Testes e utilitários**: Não há testes de regras (CPF/CNPJ, importador), nem utilitários robustos para validação.

## Itens Conformes
- **Modelo de dados Prisma**: `clients`, `monthly_services`, `annual_services`, `irpf_entries`, `documents` e `users` existentes e coerentes com a especificação.
- **Telas base**: Dashboard, Clientes, Mensais, Anuais, IRPF, Documentos — já presentes com componentes.

## Plano de Implementação
### 1) Atualizar dependências
- Atualizar `next` → `16.0.3`, `react`/`react-dom` → 18.x, `typescript` e `@types/node` compatíveis.

### 2) Criar camada de dados Prisma
- `src/lib/prisma.ts` com `PrismaClient` singleton.
- Ajustar `DATABASE_URL` conforme `.env`.

### 3) Implementar API Routes (Pages Router)
- `src/pages/api/clients/index.ts`: GET (lista, `query` de busca), POST (criar cliente).
- `src/pages/api/clients/[id].ts`: GET (detalhe), PUT/PATCH (atualizar), DELETE (remover).
- `src/pages/api/services/monthly/index.ts` e `[id].ts`: CRUD mensal.
- `src/pages/api/services/annual/index.ts` e `[id].ts`: CRUD anual.
- `src/pages/api/irpf/index.ts` e `[id].ts`: CRUD IRPF.
- `src/pages/api/documents/index.ts` e `[id].ts`: listar, upload (multipart), download, excluir.

### 4) Autenticação local
- Rotas: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/register`.
- Tabela `users`: adicionar `passwordHash` (bcrypt) — migrar Prisma.
- Sessão via cookie httpOnly (iron-session/JWT). Atualizar `AuthContext` para consumir essas rotas e encerrar `loading` sempre (timeout/erros tratados).

### 5) Refatorar hooks
- `use-clients`: trocar Supabase por `fetch('/api/clients')` e afins.
- `use-documents`: consumir `/api/documents` (upload/download/delete) e remover Supabase Storage.
- `use-import`: enviar XLSX para `/api/import/xlsx`, validação e inserção no servidor (Prisma), devolvendo prévia/erros.
- `use-export`: gerar relatórios no servidor (CSV/Excel) com endpoint dedicado; cliente apenas baixa.

### 6) Validações de negócio
- Utilitário robusto de CPF/CNPJ (dígito verificador). Usar em API e no cliente para feedback.
- Deduplicação na importação conforme especificação.

### 7) Remoções e configuração
- Remover `src/lib/supabase.ts` e dependências `@supabase/supabase-js`.
- Remover envs `NEXT_PUBLIC_SUPABASE_*` e referências.

### 8) Testes e verificação
- Testes unitários para CPF/CNPJ e importador.
- Verificar fluxo: login, dashboard sem loading infinito, CRUD funcionando via API Routes.

Posso seguir com a implementação desses pontos para alinhar 100% ao documento da especificação?