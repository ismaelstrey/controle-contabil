## Objetivo
- Criar o módulo completo de **prestação de serviços mensais** para clientes: cadastro, listagem, edição, exclusão e visualização por cliente e global.

## Modelo de Dados
- Usar o modelo Prisma existente `MonthlyService` (tabela `monthly_services`).
- Campos: `id`, `clientId`, `tipoGuia`, `regularizacao`, `situacao`, `referenceMonth`, timestamps.

## API Routes (Pages Router)
- `src/pages/api/services/monthly/index.ts`
  - `GET ?clientId=&month=&year=&search=`: lista com filtros.
  - `POST`: cria serviço mensal com validação (clientId obrigatório).
- `src/pages/api/services/monthly/[id].ts`
  - `GET`: detalhe.
  - `PUT/PATCH`: atualiza campos (`tipoGuia`, `regularizacao`, `situacao`, `referenceMonth`).
  - `DELETE`: remove.
- Regras: status codes adequados, erros claros, validação simples (ex.: `referenceMonth` como `YYYY-MM`).

## Hooks
- `src/hooks/use-monthly-services.ts`
  - `useMonthlyServices({ clientId, month, year })` → lista com React Query.
  - `createMonthlyService(payload)` → POST.
  - `updateMonthlyService(id, payload)` → PUT/PATCH.
  - `deleteMonthlyService(id)` → DELETE.
  - `invalidateCache()` e controle de carregamento/erro.

## Componentes & Páginas
- Formulário: `MonthlyServiceForm`
  - Campos: Cliente (select), Tipo de Guia, Regularização, Situação, Mês de Referência (`YYYY-MM`).
  - Integra com `createMonthlyService`/`updateMonthlyService`.
- Lista Global: `MonthlyServiceListPage` (`/services/monthly`)
  - Tabela com filtros (cliente, mês/ano, busca), ações editar/remover.
- Lista por Cliente: `ClientDetail` integra uma seção “Serviços Mensais” com tabela e botão “Adicionar”.
- Usar layout existente `DashboardLayout` e componentes UI atuais.

## Validações
- `referenceMonth`: formato `YYYY-MM` (ex.: `2025-03`).
- Campos textuais com limites razoáveis.
- `clientId` obrigatório e válido.

## UX/Fluxo
- Do Dashboard/Clientes → “Serviços Mensais” para visão geral.
- No detalhe do cliente → seção de serviços mensais com ações rápidas.
- Feedback com toasts em sucesso/erro.

## Segurança
- Autenticação: usar contexto atual (ou auth local, caso já migrado).
- API Routes protegem o acesso (verificação de sessão/cookie) antes de operar.

## Testes
- Testar criação/edição/remoção via API Routes (insomnia/curl).
- Testar listagem com filtros.

## Entregáveis
- API Routes implementadas e tipadas.
- Hook `use-monthly-services` funcional.
- Páginas/Componentes para cadastro e listagem integrados ao Layout.

Posso iniciar a implementação de rotas, hooks e UI do módulo de serviços mensais agora?