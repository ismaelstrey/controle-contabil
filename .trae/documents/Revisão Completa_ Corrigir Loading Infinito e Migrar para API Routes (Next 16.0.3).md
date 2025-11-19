## Diagnóstico
- `DashboardPage` fica preso em `loading` via `useAuthContext`.
- Possíveis causas:
  - Variáveis de ambiente do Supabase ausentes/inequívocas: `src/lib/supabase.ts:3-6` usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Sem elas, `getSession` falha e pode travar.
  - Falhas na consulta à tabela `users`/`clients` com 404 (PGRST205): evidências de tabelas indisponíveis em Supabase (não impactam diretamente o loading, mas geram fluxo quebrado).
  - Renderização bloqueada: `src/pages/dashboard.tsx:21-27` renderiza spinner enquanto `loading` for true; se `getSession` não conclui (timeout ou erro não tratado), o spinner permanece.

## Correções Planejadas (Autenticação)
1. Verificação de envs:
   - Validar presença de `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local`.
   - Adicionar guarda no `AuthContext` para marcar `loading=false` e exibir erro amigável quando envs faltarem.
2. Robustez do `AuthContext`:
   - Envolver `getSession` com timeout (ex.: 5s) para evitar travamento; após timeout, `loading=false` e exibir mensagem.
   - Já existe fallback para `session.user` quando tabela `users` não existe (`src/contexts/auth-context.tsx:41-63, 66-83, 85-111`). Manter e revisar.
3. Comportamento do `Dashboard`:
   - Ajustar lógica para não exibir spinner indefinidamente; se `loading=false` e `user=null`, renderizar uma UI de redirecionamento/login (em vez de `return null`).

## Migração para API Routes (Next 16.0.3)
1. Atualização de dependências:
   - Atualizar `next` para `16.0.3` e `react`/`react-dom` 18.x; ajustar `typescript`/`@types/node`.
2. Implementar API Routes em `src/pages/api/*`:
   - `clients/index.ts` (GET/POST), `clients/[id].ts` (GET/PUT/DELETE)
   - `services/monthly`/`annual`/`irpf` (CRUD básico)
   - `documents` (lista/exclusão; upload opcionalmente via Supabase Storage)
   - Handlers com `NextApiRequest`/`NextApiResponse`, `res.status().json()`, validações e erros claros.
3. Refatorar hooks para consumir `/api/*`:
   - `use-clients`: substituir chamadas Supabase REST por `fetch('/api/clients')` (GET/POST/PUT/DELETE; `query` para busca)
   - `use-documents`: manter Storage Supabase ou migrar gradualmente para API Route
   - `use-auth`: manter contexto atual (Supabase Auth) enquanto o restante migra

## Validação
- Confirmar envs corretas e que `AuthContext` sempre finaliza `loading`.
- Testar endpoints API e páginas: criação/lista de clientes, serviços, IRPF e documentos.
- Garantir que o Dashboard não fica preso em spinner e redireciona/mostra UI quando não autenticado.

## Entregáveis
- Autenticação robusta com fallback e sem loading infinito.
- API Routes funcionando em Next 16.0.3.
- Hooks consumindo `/api/*`.

Posso aplicar essas correções (auth/env/timeout) e implementar as API Routes com a refatoração dos hooks?