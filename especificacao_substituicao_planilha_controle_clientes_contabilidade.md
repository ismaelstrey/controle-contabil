# Especificação: Sistema para substituir a planilha `Controle_Clientes_Contabilidade.xlsx`

> Objetivo: fornecer um documento de referência (schema de banco, modelos Prisma, telas e endpoints) para construir uma aplicação web que substitua a planilha enviada. Inclui todos os campos detectados na planilha e relacionamentos sugeridos.

---

## 1. Visão geral

A planilha possui 3 abas principais:
- **Clientes Mensais** — lista de clientes com dados cadastrais e campos relacionados à prestação de serviços mensais.
- **Clientes Anuais** — registros que parecem registrar clientes com um tipo e observação (provavelmente serviços/contratos anuais).
- **IRPF 2025** — lista simples de pessoas (Nº, Nome, CPF) para fins de declaração de IRPF.

A proposta do sistema é consolidar essas informações em um modelo relacional apropriado, com uma entidade `Client` principal e relacionamentos com as tabelas de uso (mensal, anual, declarações fiscais).

---

## 2. Entidades e campos (extraídos da planilha)

### 2.1 `Client` (entidade principal)
Campos derivados / recomendados:
- `id` — UUID (PK)
- `name` — string (campo `Cliente`)
- `cnpj` — string (nullable) (campo `CNPJ`)
- `cpf` — string (nullable) (campo `CPF`)
- `notes` — text (para `Situação / Observação`)
- `createdAt` — timestamp
- `updatedAt` — timestamp

Observação: na planilha há tanto CNPJ quanto CPF; trate ambos como identificadores alternativos (pessoa física ou jurídica). Validar formato e unicity (uma pessoa não deve ter duplicatas).


### 2.2 `MonthlyClient` (registros da aba "Clientes Mensais")
Registra dados específicos de acompanhamento mensal para cada cliente.
- `id` — UUID (PK)
- `clientId` — UUID (FK -> Client.id)
- `tipoGuia` — string (campo `Tipo de Guia`)
- `regularizacao` — string (campo `Regularização`)
- `situacao` — string (campo `Situação / Observação`) — caso queira guardar por mês, manter histórico
- `referenceMonth` — date or year-month (opcional: se quiser versionar por mês)
- `createdAt`, `updatedAt`

Observação: dependendo do uso, `MonthlyClient` pode ser um registro por cliente (último estado) ou um histórico mensal com `referenceMonth`. A planilha parece ter um registro por cliente; sugiro manter `referenceMonth` nullable e usar histórico se necessário.


### 2.3 `AnnualClient` (registros da aba "Clientes Anuais")
- `id` — UUID (PK)
- `clientId` — UUID (FK -> Client.id)
- `type` — string (campo `Tipo`)
- `observation` — text (campo `Observação`)
- `year` — integer (opcional — deduzir do contexto)
- `createdAt`, `updatedAt`


### 2.4 `IrpfEntry` (aba `IRPF 2025`)
Registra pessoas para fins de IRPF.
- `id` — UUID (PK)
- `sequence_number` — integer (campo `Nº`)
- `name` — string (campo `Nome`)
- `cpf` — string (campo `CPF`)
- `clientId` — UUID (FK -> Client.id) (nullable) — se esta pessoa for um cliente armazenar relação
- `year` — integer (ex.: 2025)
- `createdAt`, `updatedAt`


## 3. Relacionamentos
- `Client` 1 — * `MonthlyClient` (um cliente pode ter vários registros mensais/históricos)
- `Client` 1 — * `AnnualClient` (um cliente pode ter vários registros anuais)
- `Client` 1 — * `IrpfEntry` (opcional: uma pessoa cliente pode também estar na lista de IRPF)

Índices importantes:
- índice único sobre `Client.cnpj` (quando não nulo)
- índice único sobre `Client.cpf` (quando não nulo)
- índice composto em `MonthlyClient(clientId, referenceMonth)` se usar histórico mensal
- índice por `IrpfEntry.cpf` para buscas rápidas


## 4. Modelo Prisma sugerido (PostgreSQL)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id          String         @id @default(uuid())
  name        String
  cnpj        String?        @unique
  cpf         String?        @unique
  notes       String?
  monthly     MonthlyClient[]
  annual      AnnualClient[]
  irpfEntries IrpfEntry[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model MonthlyClient {
  id             String   @id @default(uuid())
  client         Client   @relation(fields: [clientId], references: [id])
  clientId       String
  tipoGuia       String?
  regularizacao  String?
  situacao       String?
  referenceMonth DateTime?  // usar só ano-mês se preferir
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model AnnualClient {
  id         String   @id @default(uuid())
  client     Client   @relation(fields: [clientId], references: [id])
  clientId   String
  type       String?
  observation String?
  year       Int?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model IrpfEntry {
  id              String   @id @default(uuid())
  sequenceNumber  Int?
  name            String
  cpf             String
  client          Client?  @relation(fields: [clientId], references: [id])
  clientId        String?
  year            Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

> Nota: ajuste tipos `String`/`Int`/`DateTime` conforme necessidade (por exemplo armazenar `referenceMonth` como `String` no formato `YYYY-MM` ou `Date`).


## 5. Regras de validação e negócios (sugestões)
- Validar CPF e CNPJ com rotinas de formato e dígito verificador ao cadastrar.
- Não permitir dois `Client` com mesmo CPF ou CNPJ.
- Se um `IrpfEntry` tiver CPF que corresponda a `Client.cpf`, sugerir linkar ao cliente existente.
- Permitir importar CSV/XLSX para popular `Client`, `MonthlyClient`, `AnnualClient`, `IrpfEntry` (importador com pré-visualização e deduplicação).


## 6. Telas / UX
- **Dashboard**: resumo rápido (total clientes, clientes mensais, pendências de regularização).
- **Clientes (lista)**: pesquisa por nome, CPF/CNPJ, filtro por situação, exportar CSV.
- **Detalhe do Cliente**: informações cadastrais, histórico mensal (tabela), registros anuais, ações: editar, vincular IRPF.
- **Importar**: upload XLSX/CSV com mapeamento de colunas (para substituir a planilha atual).
- **IRPF**: lista de entradas com possibilidade de associar a cliente existente.

Tornar a interface simples e direta: formulários com validação inline, botões claros para importar/exportar, filtros fáceis.


## 7. Endpoints REST / sugestões de API (Next.js App Router / API routes)
- `GET /api/clients` — lista com filtros e paginação
- `POST /api/clients` — criar cliente
- `GET /api/clients/:id` — detalhe
- `PUT /api/clients/:id` — atualizar
- `DELETE /api/clients/:id` — excluir (ou soft-delete)

- `GET /api/clients/:id/monthly` — lista mensal do cliente
- `POST /api/clients/:id/monthly` — criar registro mensal

- `GET /api/annual` / `POST /api/annual` — endpoints para `AnnualClient`
- `GET /api/irpf` / `POST /api/irpf` — endpoints para `IrpfEntry`
- `POST /api/import/xlsx` — endpoint para importação com deduplicação


## 8. Migração e importação da planilha
- Fazer um script que leia as abas do Excel e:
  1. Normalize campos (trim, remover caracteres especiais de CPF/CNPJ)
  2. Procure clientes por CPF/CNPJ
  3. Inserir/atualizar `Client`
  4. Popular `MonthlyClient` (atribuir `referenceMonth` com o mês corrente ou deixar null)
  5. Popular `AnnualClient` e `IrpfEntry` mantendo `sequenceNumber` quando houver


## 9. Boas práticas e próximos passos
- Comece modelando `Client` + `MonthlyClient` e a importação — isso cobre a maior parte da planilha.
- Adicione testes unitários para validação de CPF/CNPJ e para o importador.
- Planeje backups automáticos do banco e endpoints protegidos por autenticação (por exemplo, NextAuth + roles: admin, operador).
- Se for necessário histórico temporal completo, implemente versionamento (audit log) ou mantenha `createdAt`/`updatedAt` e registros mensais por `referenceMonth`.


---

### Anexo: mapeamento direto das colunas da planilha
- **Clientes Mensais** -> mapeia para `Client` (name, cnpj, cpf, notes) + `MonthlyClient` (tipoGuia, regularizacao, situacao)
- **Clientes Anuais** -> `Client` (referenciar por name/CPF) + `AnnualClient` (type, observation)
- **IRPF 2025** -> `IrpfEntry` (sequenceNumber, name, cpf)


---

Se quiser, eu já gero o arquivo `.md` completo (pronto para download) e um script Node/TS de importação que lê o Excel e popula o banco usando Prisma — quer que eu gere esses artefatos agora?  

