## Diagnóstico
- `DashboardPage` usa `useAuthContext` (src/pages/dashboard.tsx:3,13), não `useAuth`; portanto, problemas em `use-auth.ts` não afetam diretamente essa página.
- `use-auth.ts` (src/hooks/use-auth.ts) não recupera a sessão atual ao montar e não assina mudanças de autenticação; o `user` só é preenchido após `signIn/signUp` no próprio hook, e se a página recarregar, `user` volta a `null`.
- Há duplicidade entre `AuthContext` e `use-auth`: cada um mantém seu próprio estado de usuário, sem compartilhamento.
- `AuthContext` (src/contexts/auth-context.tsx) tenta carregar o usuário da tabela `users`. Se não existir linha para o usuário autenticado (ex.: admin criado manualmente no Supabase), `user` no contexto fica `null`, impactando `DashboardPage`.
- Página `Settings` ainda usa `use-auth` (src/pages/settings.tsx:5,9), o que causa comportamento inconsistente.

## Correções Planejadas
1. Atualizar `use-auth.ts` para recuperar sessão ao montar e assinar mudanças:
   - `useEffect` com `supabase.auth.getSession()` para preencher `user` inicial.
   - Assinar `supabase.auth.onAuthStateChange` e atualizar `user`/`loading` conforme eventos.
2. Unificar fonte de verdade:
   - Opção A (preferida): Tornar `use-auth.ts` um wrapper que apenas retorna `useAuthContext()` (elimina duplicidade e garante consistência em toda a app sem refatorar páginas).
   - Opção B: Manter `use-auth.ts` funcional, mas documentar que `DashboardPage` deve continuar usando `useAuthContext`.
3. Melhorar `AuthContext` fallback:
   - Em `checkSession` e no listener, se não houver linha na tabela `users`, popular `user` com dados de `session.user` (id, email, `user_metadata.name`), evitando `null` indevido.
4. Alinhar `SettingsPage`:
   - Se adotarmos a Opção A, nenhuma mudança: `use-auth` passará a delegar ao contexto.
   - Caso Opção B, trocar import para `useAuthContext` em `src/pages/settings.tsx:5`.

## Validação
- Testar login, recarga de página e navegação até Dashboard/Settings para confirmar que `user` permanece disponível.
- Verificar console e UI para ausência de redirects indevidos quando autenticado.

Posso aplicar a Opção A (wrapper para `useAuthContext`) e ajustar o fallback do `AuthContext` para garantir que o usuário logado seja recuperado corretamente?