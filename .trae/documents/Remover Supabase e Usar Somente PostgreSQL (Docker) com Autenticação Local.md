## Objetivo
- Eliminar totalmente Supabase (Auth/REST/Storage) e usar apenas PostgreSQL via Docker + Prisma.
- Migrar autenticação para cookies httpOnly com API Routes e bcrypt.

## Auditoria e Remoção
- Remover arquivos e referências Supabase:
  - `src/lib/supabase.ts`, pasta `supabase/`, variáveis `NEXT_PUBLIC_SUPABASE_*` em `.env/.env.local` e `docker-compose.yml`.
  - Hooks que usam Supabase: `use-clients`, `use-documents`, `use-import`, `use-export`.
- Atualizar `docker-compose.yml` para manter somente PostgreSQL/Redis e app.

## Banco e Prisma
- Adicionar campo `passwordHash` em `User` no `prisma/schema.prisma`.
- Rodar migrações (`prisma migrate dev`) e `prisma generate`.
- Fixar conexão local (já ajustado em `src/lib/prisma.ts`).

## Autenticação Local (API Routes)
- Criar rotas:
  - `POST /api/auth/register` (opcional): cria usuário com `passwordHash` (bcrypt).
  - `POST /api/auth/login`: valida email/senha, seta cookie httpOnly (iron-session/JWT).
  - `POST /api/auth/logout`: limpa cookie.
  - `GET /api/auth/me`: retorna usuário logado via cookie.
- Atualizar `AuthContext` e `use-auth` para usar essas rotas, com timeout e `finally` para encerrar `loading`.

## API Routes de Dados (Prisma)
- Clientes:
  - `GET /api/clients`, `POST /api/clients`
  - `GET /api/clients/[id]`, `PUT/PATCH /api/clients/[id]`, `DELETE /api/clients/[id]`
- Serviços (já criados parcialmente):
  - Mensais: `/api/services/monthly` e `/api/services/monthly/[id]` (com validação de cliente existente)
  - Anuais: `/api/services/annual` e `/api/services/annual/[id]`
  - IRPF: `/api/services/irpf` e `/api/services/irpf/[id]`
- Documentos:
  - `GET/POST /api/documents` (upload multipart para `uploads/`, gravar caminho no banco)
  - `GET/DELETE /api/documents/[id]` (download/remoção)

## Refatoração de Hooks
- `use-clients`: trocar Supabase → `fetch('/api/clients')` para listagem/CRUD.
- `use-documents`: trocar Supabase Storage → rotas `/api/documents` (upload/download/delete).
- `use-import`: enviar XLSX para `/api/import/xlsx` (servidor valida e insere via Prisma).
- `use-export`: gerar relatórios no servidor e retornar arquivo para download.

## Limpezas Finais
- Remover variáveis/flags Supabase de `.env/.env.local` e `docker-compose.yml`.
- Garantir que todas páginas/hooks usam apenas `/api/*` + Prisma.

## Validação
- Fluxo completo: login/logout/refresh sem loading infinito.
- CRUD de clientes/serviços/documentos via API Routes.
- Build e execução com Docker (Postgres/Redis/app).

Posso aplicar essas alterações agora e remover Supabase completamente do projeto?