## Objetivo
- Remover totalmente a integração com Supabase (Auth, REST e Storage).
- Usar apenas PostgreSQL via Prisma e API Routes do Pages Router (Next 16.0.3).
- Manter os hooks e Contexts com a arquitetura atual, consumindo `/api/*`.

## Áreas Impactadas
- Autenticação (substituir Supabase Auth).
- Armazenamento de documentos (substituir Supabase Storage).
- Acesso a dados (substituir `supabase.from(...)` por Prisma via API Routes).
- Variáveis de ambiente e `src/lib/supabase.ts` (remover).

## Autenticação (somente PostgreSQL)
- Implementar autenticação própria com API Routes:
  - `/api/auth/login` (POST): valida email/senha (bcrypt), gera sessão com cookie httpOnly (JWT ou iron-session).
  - `/api/auth/logout` (POST): invalida sessão.
  - `/api/auth/me` (GET): retorna usuário logado a partir do cookie.
  - `/api/auth/register` (POST, opcional): cria usuário (hash de senha) usando Prisma.
- Atualizar `AuthContext`:
  - Trocar chamadas Supabase por chamadas aos endpoints acima.
  - Manter `isAuthenticated`, `loading`, `user` e funções `signIn`, `signOut`, `signUp`, `resetPassword` (reset opcional).
- Banco: usar tabela `users` já definida no Prisma (schema.prisma) com coluna de senha (adicionar `passwordHash`).

## Documentos (somente PostgreSQL)
- Alterar tabela `documents` para suportar conteúdo binário no banco (tipo `Bytes` do Prisma) ou adotar filesystem local:
  - Opção A (Postgres puro): adicionar campo `fileData Bytes` e remover `file_url`.
  - Opção B (filesystem): salvar arquivo em `uploads/` e gravar caminho no banco (continua somente local, sem Supabase).
- API Routes de documentos:
  - `/api/documents` (GET/POST): listar e fazer upload (multipart/form-data com `formidable`, desativar `bodyParser`).
  - `/api/documents/[id]` (GET/DELETE): baixar e remover.
- Atualizar `use-documents` para consumir esses endpoints.

## Dados (Clientes/Serviços/IRPF)
- Criar API Routes com Prisma:
  - `src/pages/api/clients/index.ts`: GET (lista + busca por `query`), POST (cria).
  - `src/pages/api/clients/[id].ts`: GET (detalhe), PUT/PATCH (atualiza), DELETE (remove).
  - `src/pages/api/services/monthly/index.ts` e `[id].ts`: CRUD de serviços mensais.
  - `src/pages/api/services/annual/index.ts` e `[id].ts`: CRUD de serviços anuais.
  - `src/pages/api/irpf/index.ts` e `[id].ts`: CRUD de IRPF.
- Adotar `NextApiRequest`/`NextApiResponse` com `res.status().json()` e try/catch.

## Refatoração de Hooks
- `use-clients`: trocar Supabase por `fetch('/api/clients')`, `POST`, `PUT`, `DELETE`.
- `use-documents`: trocar Supabase Storage por `/api/documents`.
- `use-auth`: manter assinatura atual do Context, agora chamando `/api/auth/*`.

## Remoções e Configuração
- Remover `src/lib/supabase.ts` e dependências `@supabase/supabase-js`.
- Remover envs `NEXT_PUBLIC_SUPABASE_*` e referências.
- Atualizar `package.json`: `next@16.0.3`, `react@18`, instalar `bcrypt`, `iron-session` (ou JWT), `formidable` (uploads), `@prisma/client` e `prisma`.

## Validação
- Rodar servidor e validar:
  - Login/Logout via cookies, `AuthContext` refletindo estado sem loading infinito.
  - Dashboard renderizando com `user` do `/api/auth/me`.
  - CRUD de clientes e serviços via API Routes.
  - Upload/Download de documentos sem Supabase.

## Entregáveis
- API Routes implementadas.
- Hooks atualizados para `/api/*`.
- Supabase removido por completo.
- Loading infinito do Dashboard resolvido (auth local robusta).

Posso aplicar essas mudanças agora (implementação das rotas, refatoração dos hooks e remoção do Supabase)?