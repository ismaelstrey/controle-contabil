## Objetivo

* Preparar a aplicação para operar na Vercel com banco de dados gerenciado, armazenamento compatível com serverless, variáveis de ambiente e pipeline de build/migração confiáveis.

## Diagnóstico Atual

* Framework: Next.js (Pages Router) com APIs em `pages/api` (compatível com Vercel Serverless Functions).

* Banco: PostgreSQL via Prisma (local Docker). Em produção, precisa de DB gerenciado (Neon, Vercel Postgres, Render, etc.).

* Sessão: cookie httpOnly simples (server-side) — compatível com Vercel.

* Upload de documentos: usa `fs` e grava em disco local (`src/pages/api/documents`). Isso não funciona na Vercel (filesystem efêmero).

* Sincronização InfoSimples: server-side com token via env — ok, mas precisa de `INFOSIMPLES_TOKEN`.

* Rate limiting: in-memory (map) — em serverless, não é consistente. Precisa serviço (Upstash Redis) ou middleware robusto.

* Prisma: versão 6.19.0, `@prisma/client` 6.19.0 — ok. Precisa garantir `prisma generate` e `migrate deploy` no build/deploy.

## Infraestrutura

* **Banco de dados**: provisionar um Postgres gerenciado (Neon recomendações para Prisma). Obter `DATABASE_URL`.

* **Armazenamento de arquivos**: migrar de FS local para um provedor:

  * Opção A: Vercel Blob (nativo e simples, adequado para SPA)

  * Opção B: S3 (Amazon S3/Cloudflare R2) com SDK

* **Rate limiting**: usar Upstash Redis (plano gratuito suficiente para throttling básico) ou Vercel Rate Limiting com KV.

## Ajustes de Código Necessários

* **Documentos (upload/GET)**

  * Substituir gravação em disco por upload ao storage escolhido (Vercel Blob/S3).

  * Persistir `fileUrl` como URL pública/assinada do blob.

  * Atualizar `/api/documents` para aceitar base64 e salvar no storage.

  * Atualizar `/api/documents/[id]` para baixar da URL do storage em vez de `fs`.

* **Rate limiting**

  * Trocar o `rateMap` in-memory por um guard com Upstash Redis, chaveada por `userId` (janela deslizante 5/min).

* **Prisma e build**

  * Adicionar `postinstall: prisma generate` no `package.json`.

  * No deploy, rodar `prisma migrate deploy`. Pode ser via `vercel` build hook ou GitHub Action.

* **Env e segurança**

  * Introduzir `.env` com: `DATABASE_URL`, `INFOSIMPLES_TOKEN`, `BCRYPT_ROUNDS`, `STORAGE_ENDPOINT/KEY/BUCKET` (se S3), ou `BLOB_READ_WRITE_TOKEN` (Vercel Blob).

  * Não expor tokens no client.

## Configuração da Vercel

* **Projeto**: importar repositório; Framework Next detectado automaticamente.

* **Build Command** (se necessário): `npm run build` (Next padrão) + hooks:

  * Opcional: `npm run db:migrate:deploy` (script que chama `prisma migrate deploy`).

* **Environment Variables (Production/Preview)**:

  * `DATABASE_URL`: URL completa do Postgres gerenciado.

  * `INFOSIMPLES_TOKEN`: token InfoSimples.

  * `BCRYPT_ROUNDS`: 12.

  * Storage: `BLOB_READ_WRITE_TOKEN` (Vercel Blob) ou `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`.

* **Node runtime**: padrão (Node 18+). Evitar Edge Functions para Prisma.

## Migração de Banco

* Após apontar `DATABASE_URL`, executar:

  * `prisma migrate deploy` no ambiente Vercel (ou via CI)

  * `prisma db seed` (opcional) para criar admin (email e senha já definidos).

## Observabilidade

* Logs: Vercel fornece logs de functions.

* Monitoramento de erros: opcionalmente Sentry.

* Auditoria de sincronizações: opcional `ApiRequestLog` (já planejado).

## Testes e Validações

* **Preview Deploy**:

  * Criar empresa e sincronizar períodos (sem `periodo` e com `periodo`).

  * Validar upload/download de documento (após migração para Blob/S3).

  * Validar rate limiting (5 chamadas/min → 429).

* **SEO/SSR**: páginas protegidas exigem login; comportamento de redirecionamento funciona em Preview.

## Passos de Execução

1. Provisionar Postgres (Neon) e atualizar `DATABASE_URL` no Vercel (Preview/Prod).
2. Provisionar Storage (Vercel Blob ou S3) e definir variáveis.
3. Implementar a migração do upload de `fs` → storage (API e hooks de documentos).
4. Substituir `rateMap` por Upstash Redis (chave por `userId`).
5. Ajustar `package.json` scripts:

   * `postinstall`: `prisma generate`

   * `db:migrate:deploy`: `prisma migrate deploy`
6. Configurar `INFOSIMPLES_TOKEN` no Vercel.
7. Deploy Preview → validar rotas API e UI.
8. Deploy Production → rodar `migrate deploy` e `db seed` se necessário.

## Riscos e Mitigações

* **Filesystem**: sem adaptação, uploads falham; resolver com Blob/S3.

* **Prisma engines**: garantir versão alinhada e gerar client durante build (`postinstall`).

* **Rate limiting**: in-memory não confiável; usar Redis gerenciado.

* **Custos InfoSimples**: persistir períodos para evitar reconsulta desnecessária; já implementado com idempotência.

## Checklist de Ambiente

* `.env` (local) e Vercel Env:

  * `DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public`

  * `INFOSIMPLES_TOKEN=...`

  * `BCRYPT_ROUNDS=12`

  * Storage: `BLOB_READ_WRITE_TOKEN` OU `S3_*`

## Entregáveis no Próximo Passo

* Código de migração do upload para Vercel Blob/S3 e rate limit com Upstash.

* Scripts `postinstall` e `db:migrate:deploy` configurados.

* Guia de variáveis de ambiente preenchendo `.env.example`.

