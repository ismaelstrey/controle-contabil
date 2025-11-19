## Problema
- Prisma tenta conectar ao host do Supabase (`db.vxxhiopiyvfxolgiapfh.supabase.co:5432`), causando `PrismaClientInitializationError`.
- Apesar de `.env` e `.env.local` apontarem para `localhost`, algum ambiente está sobrescrevendo `DATABASE_URL`.

## Correções Planejadas
- Forçar o Prisma a usar o `DATABASE_URL` local em runtime via `datasources` no `PrismaClient`.
- Confirmar Docker Compose do PostgreSQL (`postgres:5432`) e manter compatível com `.env` (`localhost:5432`).
- Remover referências de Supabase nas envs para evitar confusão futura.
- Validar/migrar o schema com Prisma (criação de tabelas caso ausentes).

## Implementação
1. Atualizar `src/lib/prisma.ts` para instanciar `PrismaClient` com `datasources.db.url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contabiljaque?schema=public'`.
2. Manter `docker-compose.yml` com `app.environment.DATABASE_URL=postgresql://postgres:postgres@postgres:5432/contabiljaque?schema=public` (já configurado).
3. Sugerir remover `NEXT_PUBLIC_SUPABASE_*` de `.env.local` após migração completa.
4. Após ajuste, rodar migrações e regenerar client (fora do escopo aqui): `npx prisma migrate dev && npx prisma generate`.

## Validação
- Acessar `/api/services/monthly` e `/api/services/annual` sem erro de conexão.
- Verificar que o Dashboard e listas carregam dados do PostgreSQL local.

Posso aplicar a atualização em `src/lib/prisma.ts` agora?