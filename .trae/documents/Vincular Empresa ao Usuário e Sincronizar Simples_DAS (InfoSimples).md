## Objetivo
- Permitir cadastrar empresas vinculadas ao usuário com dados completos (CNPJ, tipo, regime, porte, CNAE opcional) e sincronizar informações de Simples/DAS via InfoSimples.
- Persistir os resultados da API para evitar custos em chamadas repetidas.

## Modelo de Dados (Prisma)
- Company (nova tabela):
  - id (uuid), userId (fk User), cnpj (string, único, normalizado 14 dígitos), razaoSocial (string), tipoEmpresa (enum: MEI, EI, LTDA, SLU, SA, SociedadeSimples, Cooperativa), porte (enum: ME, EPP, Media, Grande), regimeTributario (enum: SimplesNacional, LucroPresumido, LucroReal), cnaePrincipal (string, opcional), createdAt, updatedAt, lastSyncAt (datetime, opcional).
- DasPeriod (nova tabela):
  - id (uuid), companyId (fk Company), periodo (string AAAAMM), situacao (string), apurado (string), principal (decimal), multas (decimal), juros (decimal), total (decimal), dataVencimento (date), dataAcolhimento (date), dataPagamento (date), icms (decimal), iss (decimal), inss (decimal), numeroApuracao (string), numeroDas (string), codigoBarras (string), urlDas (string), mensagem (string, opcional), createdAt.
- ApiRequestLog (opcional, para auditoria/custos):
  - id, companyId, endpoint (string), billable (bool), price (decimal), requestedAt, tokenName (string, opcional), signature (string, opcional), rawHeader (json), rawData (json).

## Normalização e Validação
- Normalizar CNPJ removendo não-dígitos e validando tamanho (14). Armazenar apenas normalizado.
- Converter valores monetários "R$ 72,00" para decimal (ponto flutuante) e datas para ISO.
- Gerar periodo AAAAMM a partir de entrada ou utilizar o fornecido.

## Integração com InfoSimples (Server-side)
- Variável de ambiente: `INFOSIMPLES_TOKEN` (não expor no client).
- Endpoint: `POST https://api.infosimples.com/api/v2/consultas/receita-federal/simples-das`.
- Parâmetros obrigatórios: `token`, `cnpj`; opcionais: `periodo` (AAAAMM), `data_pagamento` (ISO dentro dos próximos 15 dias úteis).
- Tratamento de erros da API (ex.: `code: 601` → token inválido) e mapeamento do `code_message`.

## Rotas de API (Next.js Pages Router)
- `POST /api/companies`: cria empresa vinculada ao usuário autenticado.
- `GET /api/companies`: lista empresas do usuário.
- `GET /api/companies/:id`: detalhes.
- `POST /api/companies/:id/sync-das`: realiza a chamada ao InfoSimples e persiste `DasPeriod` e, opcionalmente, `ApiRequestLog`.
  - Query params: `periodo`, `data_pagamento`; body/params para flexibilidade.
  - Idempotência: se já existir `DasPeriod` para o `periodo`, não chamar API a menos de `force=true`.

## Fluxo de Sincronização
1. Usuário cadastra empresa (CNPJ, tipo, porte, regime, CNAE). CNPJ é normalizado.
2. Ao acionar “Sincronizar Simples/DAS”, servidor monta requisição com `INFOSIMPLES_TOKEN` e `cnpj`.
3. Resposta: mapear `header` (custos, metadata) e `data[0].periodos[...]` para registros `DasPeriod` (um por período retornado).
4. Persistir tudo; retornar resumo (períodos inseridos/atualizados) ao client.

## UI/UX
- Formulário de Empresa:
  - Campos: CNPJ (com máscara/normalização), Razão Social, Tipo de Empresa (select), Porte (select), Regime Tributário (select), CNAE (opcional).
  - Botão “Salvar” cria empresa via `/api/companies`.
- Botão “Sincronizar Simples/DAS” na listagem/detalhe da empresa:
  - Abre modal com campos opcionais `periodo` e `data_pagamento`.
  - Após sincronizar, renderiza tabela dos `DasPeriod` com valores e situação.
- SPA: modais (similar aos já usados no dashboard) para criar empresa e sincronizar.

## Segurança e Governança
- Token apenas em server-side; nunca expor ao client.
- Rate limiting básico por usuário para `/sync-das`.
- Auditoria de custo/operação em `ApiRequestLog` (opcional, recomendado).
- Cache/idempotência por (`companyId`, `periodo`).

## Implementação Técnica
- Prisma:
  - Adicionar enums e modelos (`Company`, `DasPeriod`, `ApiRequestLog`).
  - Migrar: `prisma migrate dev`.
- Utils:
  - `normalizeCnpj(cnpj)`, `parseCurrency(str)`, `parseDate(str)`.
- API:
  - Middlewares de sessão (reuso de `getSessionId`), validação dos inputs.
  - Função `callInfoSimplesSimplesDas(params)` com fetch server-side.
  - Persistência: upsert de `DasPeriod` por (`companyId`,`periodo`).
- UI:
  - Hooks `useCompanies` e `useDasPeriods(companyId)`.
  - Componentes: `CompanyForm`, `CompanyList`, `CompanyDetail` (com botão “Sincronizar”).

## Testes
- Unit: normalização de CNPJ, parse de moeda/data.
- Integração: mock da resposta InfoSimples e verificação de inserção de `DasPeriod`.
- E2E manual: criar empresa, sincronizar período, verificar persistência.

## Entregáveis
- Schemas Prisma atualizados e migrados.
- Rotas de API para CRUD de `Company` e sync de DAS.
- UI de cadastro e sincronização com modais.
- Documentação de env: `INFOSIMPLES_TOKEN`.

## Próximos Passos
1. Criar enums e modelos no Prisma; migrar.
2. Implementar endpoints `/api/companies` e `/api/companies/:id/sync-das`.
3. Funções de normalização/parsing.
4. UI: formulários e modais.
5. Testes e validação de fluxo.
