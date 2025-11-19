## Problemas Encontrados
- Imports de componentes inexistentes nas páginas:
  - `src/pages/dashboard.tsx:4-7` (`DashboardLayout`, `ClientList`, `MonthlyServiceList`, `AnnualServiceList`)
  - `src/pages/clients/index.tsx:4-5` (`DashboardLayout`, `ClientList`)
  - `src/pages/clients/new.tsx:4-5` (`DashboardLayout`, `ClientForm`)
  - `src/pages/clients/[id].tsx:4-5` (`DashboardLayout`, `ClientDetail`)
  - `src/pages/services/monthly.tsx:4-5` (`DashboardLayout`, `MonthlyServiceList`)
  - `src/pages/services/annual.tsx:4-5` (`DashboardLayout`, `AnnualServiceList`)
  - `src/pages/irpf.tsx:4-5` (`DashboardLayout`, `IrpfList`)
  - `src/pages/documents.tsx:4-5` (`DashboardLayout`, `DocumentList`)
- Uso incorreto do hook de autenticação:
  - Páginas importam `useAuth` de `contexts/auth-context`, mas o contexto exporta `useAuthContext` (ex.: `src/pages/documents.tsx:3`, `src/pages/dashboard.tsx:3`, etc.).
- Bug no filtro de serviços em `use-clients.ts`:
  - `src/hooks/use-clients.ts:142-151` usa campos inexistentes (`monthly_service`, `annual_service`, `irpf_entry`). O select retorna `monthly_services`, `annual_services`, `irpf_entries`.

## Correções de Código (Planejadas)
- Atualizar todas as páginas para usar `useAuthContext` no lugar de `useAuth`.
- Corrigir a função `getClientsByServiceType` em `src/hooks/use-clients.ts` para:
  - `monthly`: `Array.isArray(client.monthly_services) && client.monthly_services.length > 0`
  - `annual`: `Array.isArray(client.annual_services) && client.annual_services.length > 0`
  - `irpf`: `Array.isArray(client.irpf_entries) && client.irpf_entries.length > 0`

## Criação dos Componentes Faltantes
- `src/components/dashboard-layout.tsx`
  - Layout básico com header, navegação (Dashboard, Clientes, Serviços Mensais, Serviços Anuais, IRPF, Documentos, Configurações) e wrapper `children`.
  - Usa `useAuthContext` para exibir usuário e botão de logout.
- `src/components/client-list.tsx`
  - Lista clientes usando `useClients()`: nome, email, status e ações (ver/editar, remover).
  - Suporte a busca (via `searchClients`) e ordenação simples.
- `src/components/client-form.tsx`
  - Formulário de criação/edição com `name`, `email`, `cpf_cnpj`, integra `createClient` e `updateClient`.
- `src/components/client-detail.tsx`
  - Exibe dados do cliente por `clientId` usando `getClientById`, mostra serviços vinculados.
- `src/components/monthly-service-list.tsx`
  - Lista clientes com serviços mensais via `getClientsByServiceType('monthly')` (após correção do hook).
- `src/components/annual-service-list.tsx`
  - Lista clientes com serviços anuais via `getClientsByServiceType('annual')`.
- `src/components/irpf-list.tsx`
  - Lista clientes com lançamentos IRPF via `getClientsByServiceType('irpf')`.
- `src/components/document-list.tsx`
  - Lista/baixa/exclui documentos com `useDocuments()`; filtro por cliente opcional.
- `src/components/settings-form.tsx`
  - Ajusta preferências do app via `useAppContext` (tema, linguagem, paginação, formatos).

## Validação
- Rodar o servidor e validar navegação e páginas sem erros de import.
- Testar fluxo de login e acesso ao dashboard.
- Exercitar cada página (Clientes, Mensais, Anuais, IRPF, Documentos, Configurações) para garantir que renderizam e interagem sem erros.

## Observações
- Manter estilo e padrões atuais (TypeScript, componentes funcionais, shadcn/UI existente, hooks próprios).
- Evitar comentários no código e seguir nomes e caminhos já usados nas páginas. 

Confirma que posso aplicar essas correções e criar os componentes base?