## Auditoria Atual
- Rotas existentes: `src/pages/api/services/monthly/index.ts`, `src/pages/api/services/monthly/[id].ts` já usam Prisma.
- Rotas ausentes: não há `annual` nem `irpf` em `src/pages/api/services/*`.
- Modelo Prisma pronto: `MonthlyService`, `AnnualService`, `IrpfEntry` e `Document` definidos em `prisma/schema.prisma:48–109`.

## Implementações Planejadas
### 1) Services: Annual
- Criar `src/pages/api/services/annual/index.ts`:
  - `GET ?clientId=&year=&search=`: lista com filtros.
  - `POST`: cria serviço anual (campos: `clientId`, `type`, `observation`, `year`).
- Criar `src/pages/api/services/annual/[id].ts`:
  - `GET`: detalhe.
  - `PUT/PATCH`: atualiza.
  - `DELETE`: remove.
- Usar `PrismaClient` de `src/lib/prisma.ts`, respostas com `res.status().json()` e try/catch.

### 2) Services: IRPF
- Criar `src/pages/api/services/irpf/index.ts`:
  - `GET ?clientId=&year=&search=`: lista com filtros.
  - `POST`: cria entrada IRPF (`name`, `cpf`, `sequenceNumber`, `clientId?`, `year?`).
- Criar `src/pages/api/services/irpf/[id].ts`:
  - `GET`: detalhe.
  - `PUT/PATCH`: atualiza.
  - `DELETE`: remove.
- Usar Prisma e padrões de API Routes.

### 3) Verificação de Banco e Migrações
- Validar `DATABASE_URL` (prisma/schema.prisma:7). Se tabelas estiverem ausentes:
  - Executar `prisma migrate dev` para criar `annual_services`, `irpf_entries` e garantir índices.
  - Executar `prisma generate` para atualizar cliente.

### 4) Hooks e UI
- Adicionar hooks:
  - `src/hooks/use-annual-services.ts`: lista/CRUD via `/api/services/annual`.
  - `src/hooks/use-irpf-services.ts`: lista/CRUD via `/api/services/irpf`.
- Atualizar componentes:
  - `src/components/annual-service-list.tsx`: consumir `use-annual-services` em vez de `use-clients`/Supabase.
  - `src/components/irpf-list.tsx`: consumir `use-irpf-services`.

### 5) Remoção de Supabase nas Services
- Garantir que nenhum código de services use `supabase.from(...)`.
- Manter padrão de API Routes com Next 16 e PostgreSQL via Prisma.

### 6) Validação e Testes
- Testar endpoints via navegador/Insomnia (`GET/POST/PUT/DELETE`).
- Validar páginas (`/services/annual`, `/irpf`) renderizando sem erros e com filtros.

## Entregáveis
- Rotas `/api/services/annual/*` e `/api/services/irpf/*` implementadas.
- Hooks e componentes atualizados para usar PostgreSQL via API Routes.
- Banco verificado e, se necessário, migrado com Prisma.

Posso começar a criar as rotas e hooks e ajustar os componentes agora?