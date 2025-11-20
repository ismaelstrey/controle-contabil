# Remoção do campo legado `cpf_cnpj` e finalização do modelo Client

## Resumo
- Removido `clients.cpf_cnpj` e finalizada estrutura com `cpf`/`cnpj` exclusivos.
- Adicionadas constraints no banco para XOR (exatamente um) e formato (somente dígitos com tamanhos 11/14).
- Código atualizado (API, hooks, componentes, tipos) para não depender do legado.

## Migrações
- `20251120011932_add_cpf_cnpj_checks`: adiciona constraints de formato e não-ambos.
- `20251120012037_backfill_cpf_cnpj`: preenche `cpf`/`cnpj` a partir de `cpf_cnpj` existente.
- `20251120013500_drop_legacy_cpf_cnpj_and_xor`: remove coluna `cpf_cnpj`, troca constraint para XOR e mantém formato.

## Atualizações de Código
- API clientes: criação/edição usam apenas `cpf` ou `cnpj`.
- Import XLSX: popula apenas `cpf`/`cnpj`.
- Backup import/export: não usa campo legado.
- Frontend: tipos, hooks e formulários atualizados para `cpf`/`cnpj`.

## Backup e Reset
- Backup de desenvolvimento gerado em `backups/dev-backup-*.json`.
- Reset executado via `prisma migrate dev` (aplicação de migrações sincronizadas).

## Testes
- Util `src/lib/doc-validation.js` com testes em `__tests__/doc-validation.test.ts` cobrindo normalização e regras.

## Observações
- Em produção, executar procedimentos de backup/restauro equivalentes antes da migração.
- Validar inserções: sem documento → erro; ambos → erro; formatos inválidos → erro.