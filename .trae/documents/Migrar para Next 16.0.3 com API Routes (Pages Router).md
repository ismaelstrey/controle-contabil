## Objetivo
- Atualizar para `next@16.0.3` e migrar o backend para API Routes do Pages Router.
- Eliminar chamadas diretas ao Supabase no cliente para dados de negócio e centralizar via `/api/*`.

## Atualização de Dependências
- `next` → `16.0.3`
- `react` e `react-dom` → versão estável compatível (18.x)
- `typescript` e `@types/node` → versões atuais compatíveis com Next 16
- Remover flags experimentais no `next.config.js` (já removidas) e manter Pages Router

## Arquitetura de API Routes
- Estrutura em `src/pages/api`:
  - `clients/index.ts` (GET lista, POST cria)
  - `clients/[id].ts` (GET detalhe, PUT/PATCH atualiza, DELETE remove)
  - `services/monthly/index.ts`, `services/monthly/[id].ts`
  - `services/annual/index.ts`, `services/annual/[id].ts`
  - `irpf/index.ts`, `irpf/[id].ts`
  - `documents/index.ts`, `documents/[id].ts` (lista/baixa/exclui)
- Handlers com `NextApiRequest`/`NextApiResponse`, uso de `res.status().json()`
- Validação básica de payload (Zod leve ou validações manuais) e tratamento de erros em try/catch

## Camada de Dados
- Usar Prisma com `DATABASE_URL` (já configurado) para dados: `clients`, `monthly_services`, `annual_services`, `irpf_entries`, `documents` (schema existente em prisma/schema.prisma)
- Opcional: manter Supabase apenas para Storage de documentos; encapsular via API Route para upload/download se preferir servidor

## Refatoração de Hooks
- `use-clients`:
  - Trocar `supabase.from(...)` por `fetch('/api/clients')` (GET)
  - POST `/api/clients` para criar; `PUT/PATCH /api/clients/[id]`; `DELETE /api/clients/[id]`
  - `searchClients` com `GET /api/clients?query=...`
- `use-documents`:
  - Manter com Supabase Storage ou migrar para `/api/documents` (decidimos na execução; recomendada migração gradual)
- `use-auth`/contexto:
  - Continuar com `useAuthContext` enquanto a autenticação estiver baseada no Supabase; sem alterações necessárias no escopo de API Routes

## Políticas e Erros Atuais
- Erros PGRST205/404 serão resolvidos ao parar de usar Supabase REST para dados e usar Prisma nas rotas
- Manter mensagens de fallback nos hooks até concluir a migração

## Testes e Validação
- Rodar servidor e testar endpoints via navegador/Insomnia
- Validar páginas: Dashboard, Clientes, Mensais, Anuais, IRPF, Documentos sem 404
- Confirmar que `ClientForm` cria via API e que React Query atualiza cache

## Entregáveis
- API Routes implementadas e tipadas
- Hooks atualizados para consumir `/api/*`
- Dependências atualizadas para Next 16.0.3

Posso iniciar criando as rotas em `src/pages/api/*` e refatorando os hooks para usar esses endpoints, mantendo Prisma como camada de dados?