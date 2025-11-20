## Objetivo
Atualizar `Client` em `prisma/schema.prisma` para suportar PF (CPF) e PJ (CNPJ), com campos documentados, unicidade, validação de formato e regra de exclusividade (apenas um entre CPF/CNPJ), mantendo compatibilidade com o campo legado `cpf_cnpj`.

## Alterações no Schema
- Manter `cpfCnpj` existente (legado) para compatibilidade; documentar como deprecado para uso futuro.
- Adicionar campos opcionais para PF:
  - `cpf String? @unique @db.Char(11) @map("cpf")`
  - `dataNascimento DateTime? @map("data_nascimento")`
  - `codigoAcesso String? @map("codigo_acesso")`
  - `senhaGov String? @map("senha_gov")`
- Adicionar campos opcionais para PJ:
  - `cnpj String? @unique @db.Char(14) @map("cnpj")`
  - `codigoRegularize String? @map("codigo_regularize")`
  - `senhaNfse String? @map("senha_nfse")`
- Adicionar documentação (`///`) em cada novo campo.
- Adicionar `@@index([cpf])` e `@@index([cnpj])` para performance de consultas.
- Implementar exclusividade CPF/CNPJ via constraint de banco: `CHECK ((cpf IS NULL) <> (cnpj IS NULL))`.
- Validar formato via constraints de banco:
  - `cpf ~ '^[0-9]{11}$'`
  - `cnpj ~ '^[0-9]{14}$'`
- Referência do modelo a alterar: `prisma/schema.prisma:24` (model `Client`).

## Trecho proposto (schema)
```prisma
model Client {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  email     String   @unique

  /// Campo legado com CPF/CNPJ. Usar apenas para compatibilidade; preferir `cpf` ou `cnpj`.
  cpfCnpj   String   @unique @map("cpf_cnpj")

  /// CPF (apenas dígitos, 11 caracteres). Exclusivo com `cnpj`.
  cpf       String?  @unique @db.Char(11) @map("cpf")
  /// Data de nascimento (PF).
  dataNascimento DateTime? @map("data_nascimento")
  /// Código de acesso (PF) para portais fiscais.
  codigoAcesso    String?  @map("codigo_acesso")
  /// Senha GOV (PF) para autenticação em gov.br.
  senhaGov        String?  @map("senha_gov")

  /// CNPJ (apenas dígitos, 14 caracteres). Exclusivo com `cpf`.
  cnpj      String?  @unique @db.Char(14) @map("cnpj")
  /// Código Regularize (PJ).
  codigoRegularize String? @map("codigo_regularize")
  /// Senha NFSe (PJ).
  senhaNfse        String? @map("senha_nfse")

  phone     String?
  address   Json?
  status    Status   @default(ACTIVE)
  notes     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  monthlyServices MonthlyService[]
  annualServices  AnnualService[]
  irpfEntries     IrpfEntry[]
  documents       Document[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([cpf])
  @@index([cnpj])
  @@map("clients")
}
```

## Migração de Banco (compatibilidade e validações)
1. Gerar migração com adição dos novos campos como `NULL` inicialmente.
2. Backfill dos dados a partir de `cpf_cnpj`:
   - Se `length(cpf_cnpj)=11` e apenas dígitos → preencher `cpf`.
   - Se `length(cpf_cnpj)=14` e apenas dígitos → preencher `cnpj`.
3. Criar índices únicos para `cpf` e `cnpj`.
4. Adicionar constraints de verificação:
   - Exclusividade: `CHECK ((cpf IS NULL) <> (cnpj IS NULL))`.
   - Formato: `CHECK (cpf ~ '^[0-9]{11}$')` e `CHECK (cnpj ~ '^[0-9]{14}$')`.
5. Manter `cpf_cnpj` até a aplicação migrar totalmente para os novos campos.

Observação: As constraints `CHECK` serão adicionadas editando o SQL da migração gerada (`prisma migrate dev --create-only`) para PostgreSQL, pois o Prisma não expõe `@@check` nativamente.

## Regras de Negócio no Aplicativo
- Ao cadastrar/atualizar `Client`, normalizar CPF/CNPJ para somente dígitos e validar dígito verificador.
- Impedir envio simultâneo de `cpf` e `cnpj`; exigir exatamente um preenchido.
- Preferir consultas por `cpf` para PF e `cnpj` para PJ; evitar uso de `cpfCnpj` em novos fluxos.

## Verificação
- Rodar geração de client (`prisma generate`) e migração (`prisma migrate dev`).
- Validar inserções:
  - PF com apenas `cpf` (11 dígitos) aceita.
  - PJ com apenas `cnpj` (14 dígitos) aceita.
  - Ambos preenchidos: rejeitado pela constraint.
  - Formatos inválidos: rejeitados pela constraint.
- Garantir queries e relações existentes continuam funcionando (campo legado permanece).

## Próximos Passos
- Aplicar a migração.
- Atualizar serviços de criação/edição de clientes para usar `cpf`/`cnpj`.
- Planejar descontinuação de `cpf_cnpj` após migração completa do código.