## Objetivo
Remover definitivamente o campo legado `cpf_cnpj` do modelo/tabela `clients`, finalizar a estrutura com `cpf`/`cnpj`, atualizar todo o código que referenciava o legado, validar integridade e documentar.

## Ambiente e Precauções
- Executar tudo em desenvolvimento/teste primeiro (banco `contabiljaque` local).
- Realizar backup completo antes de qualquer reset/migração.
- Planejar rollback: manter artefatos de backup para restauro caso necessário.

## 1) Backup
- Usar endpoint existente de exportação (Pages API): `src/pages/api/backup/export` (rota `/api/backup/export`).
- Exportar coleções: `users`, `companies`, `clients`, `monthlyServices`, `annualServices`, `irpfEntries`, `documents`, `dasPeriods`.
- Salvar arquivo `backups/dev-clients-YYYYMMDD-HHMM.json` com todo conteúdo.

## 2) Reset controlado da tabela
- Após backup, executar `prisma migrate reset` (apenas dev) para limpar dados fictícios e reaplicar migrações do zero.
- Confirmar que o reset não é feito em produção.

## 3) Migração de Banco (remoção de legado e correções)
- Remover coluna `cpf_cnpj` da tabela `clients`:
  - Alterar schema: remover campo `cpfCnpj` do `model Client` em `prisma/schema.prisma:29-30`.
  - Criar migração SQL que:
    - `ALTER TABLE clients DROP COLUMN cpf_cnpj;`
    - Remove índices únicos/índices legados relacionados a `cpf_cnpj` (se existirem).
- Atualizar constraint de exclusividade para XOR (exatamente um documento):
  - `CHECK ((cpf IS NOT NULL AND cnpj IS NULL) OR (cpf IS NULL AND cnpj IS NOT NULL))`
- Manter validação de formato:
  - `CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$')`
  - `CHECK (cnpj IS NULL OR cnpj ~ '^[0-9]{14}$')`
- Manter índices únicos atuais: `clients_cpf_key`, `clients_cnpj_key`.

## 4) Atualizações de Código (remover referências ao legado)
- API clientes:
  - `src/pages/api/clients/index.ts`
    - GET: remover filtro por `c.cpfCnpj` e usar `c.cpf`/`c.cnpj`.
    - POST: parar de povoar `cpfCnpj`; aceitar exclusivamente `cpf` OU `cnpj`.
  - `src/pages/api/clients/[id].ts`
    - PUT/PATCH: parar de sincronizar `cpfCnpj`; manter lógica de aceitar apenas um documento.
- Importação XLSX:
  - `src/pages/api/import/xlsx.ts`: não escrever `cpfCnpj`; apenas `cpf`/`cnpj`.
- Backup/Restore:
  - `src/pages/api/backup/import.ts`: remover uso/expectativa de `cpfCnpj`; mapear somente `cpf`/`cnpj`.
  - `src/pages/api/backup/export.ts`: excluir `cpfCnpj` dos dados exportados de `clients`.
- Frontend:
  - Tipos: `src/types/index.ts`
    - Remover `cpf_cnpj`; manter `cpf?` e `cnpj?` e campos PF/PJ.
  - Hooks:
    - `src/hooks/use-clients.ts`: mapeamentos e payloads sem `cpf_cnpj`; busca considera `cpf`/`cnpj`.
    - `src/hooks/use-import.ts`: validação aceita `CPF`/`CNPJ`; remover menções ao legado.
    - `src/hooks/use-export.ts`: exibir `cpf`/`cnpj`; remover fallback ao legado.
  - Componentes:
    - `src/components/client-form.tsx`: remover campo legado; manter inputs `CPF` e `CNPJ` exclusivos.
    - `src/components/client-detail.tsx` e `client-list.tsx`: substituir exibição do legado por `cpf`/`cnpj`.
- Limpeza de artefatos:
  - Ajustar `init.sql` e migrações antigas se referirem a `cpf_cnpj` (apenas histórico; não aplicadas novamente).

## 5) Verificação de Integridade
- Popular base com alguns registros PF e PJ válidos.
- Tentar inserir com ambos documentos: deve falhar (CHECK XOR).
- Tentar inserir sem documento: deve falhar (CHECK XOR exige um).
- Tentar inserir com formatos inválidos: deve falhar (CHECK regex).
- Consultas e telas devem funcionar sem `cpf_cnpj`.

## 6) Fase Final de Desenvolvimento
- Confirmar que a estrutura final está apenas com `cpf` e `cnpj`.
- Confirmar migrações aplicadas e sem pendências.
- Atualizar rotas de API e UIs para não depender do legado.

## 7) Documentação
- Criar um documento `docs/migration-cpf-cnpj.md` descrevendo:
  - Motivo da remoção de `cpf_cnpj`.
  - Novas colunas e constraints.
  - Passos de backup, reset, migração, verificação.
  - Impactos em API, hooks, componentes e tipos.

## 8) Testes
- Atualizar/Adicionar testes com Jest:
  - API `/api/clients` POST: aceita somente um documento; rejeita ambos; rejeita ausência; valida tamanhos 11/14.
  - Import XLSX: cria corretamente `cpf`/`cnpj` sem `cpfCnpj`.
  - Backup import/export: não inclui o legado; restaura dados com `cpf`/`cnpj`.

## Referências para Atualização (linhas)
- `prisma/schema.prisma:29-30` (remover campo e docs legado)
- `src/pages/api/clients/index.ts:26-33,70-87` (remover uso/escrita de `cpfCnpj`)
- `src/pages/api/clients/[id].ts:64-72` (remover sincronização `cpfCnpj`)
- `src/pages/api/import/xlsx.ts:50-53` (remover `cpfCnpj`)
- `src/pages/api/backup/import.ts:112,130` (remover `cpfCnpj`)
- `src/hooks/use-clients.ts:29-45,70-86,98-115,129-135` (mapeamento e payloads)
- `src/types/index.ts:1-16,79-88` (remover `cpf_cnpj`)
- `src/components/client-form.tsx:60-68,70-77` (remover campo legado)
- `src/hooks/use-export.ts:29-45,134-142,175-181,250-257` (remover fallback legado)
- `src/hooks/use-import.ts:39-46,143-150` (remover validação legado)

## Sequência de Execução Planejada
1. Exportar backup via `/api/backup/export` e salvar arquivo.
2. Criar migração Prisma para: remover coluna `cpf_cnpj` e atualizar CHECK para XOR; manter índices únicos.
3. Resetar banco (dev) e reaplicar migrações.
4. Atualizar código removendo todas referências ao legado, conforme arquivos listados.
5. Rodar `type-check`, `build` e testes Jest.
6. Validar via inserções/consultas manuais e endpoints.
7. Documentar em `docs/migration-cpf-cnpj.md`.

Confirma para iniciar a execução das alterações e migrações.