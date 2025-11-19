## Problema
- Após atualizar o navegador, o Dashboard fica preso em `loading` e só volta ao limpar token e relogar. O `AuthContext` ainda depende do Supabase, que mantém/renova tokens; qualquer erro na leitura/renovação faz o `loading` travar ou a sessão ficar inconsistente.

## Solução
### 1) Autenticação local com cookies httpOnly
- Implementar API Routes:
  - `POST /api/auth/login` (email/senha → valida com Prisma + bcrypt, grava sessão em cookie via iron-session)
  - `POST /api/auth/logout` (apaga cookie)
  - `GET /api/auth/me` (retorna usuário atual a partir do cookie)
  - `POST /api/auth/register` (opcional, cria usuário com `passwordHash`)
- Adicionar `passwordHash` ao modelo `User` (Prisma migration).

### 2) Atualizar AuthContext e hooks
- `AuthContext` passa a usar `/api/auth/me` no `checkSession`, com **timeout e finally** garantindo `loading=false` mesmo em erro.
- `signIn` chama `/api/auth/login`, atualiza `user` e encerra `loading` corretamente.
- `signOut` chama `/api/auth/logout` e zera `user`.
- Remover qualquer dependência de Supabase (`src/lib/supabase.ts`).

### 3) Ajustes de UI
- No `DashboardPage`, se `loading=false` e `user=null`, redirecionar para `/login` sem retornar `null` indefinidamente.
- Evitar leitura de tokens no `localStorage`; toda sessão via cookie httpOnly.

### 4) Validação e testes
- Testar refresh do navegador: `AuthContext` deve finalizar `loading` e manter usuário sem precisar limpar tokens.
- Rodar cenário de login/logout/refresh em Dashboard e páginas protegidas.

### 5) Entregáveis
- Rotas `/api/auth/*` implementadas
- `AuthContext` e `use-auth` ajustados a cookies
- Supabase removido do auth
- Loading infinito resolvido

Posso implementar agora essas rotas e atualizar o contexto para remover Supabase e usar cookies httpOnly?