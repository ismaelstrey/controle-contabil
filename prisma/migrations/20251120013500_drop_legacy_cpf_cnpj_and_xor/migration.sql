-- Drop legacy column and enforce XOR constraint
ALTER TABLE "clients" DROP COLUMN "cpf_cnpj";

-- Replace previous non-both constraint with XOR (exactly one present)
ALTER TABLE "clients"
  DROP CONSTRAINT IF EXISTS "clients_no_both_cpf_cnpj";

ALTER TABLE "clients"
  ADD CONSTRAINT "clients_xor_cpf_cnpj"
  CHECK ((cpf IS NOT NULL AND cnpj IS NULL) OR (cpf IS NULL AND cnpj IS NOT NULL));

-- Keep format constraints (already added previously); include IF to avoid duplicates
ALTER TABLE "clients"
  DROP CONSTRAINT IF EXISTS "clients_cpf_format";

ALTER TABLE "clients"
  ADD CONSTRAINT "clients_cpf_format" CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$');

ALTER TABLE "clients"
  DROP CONSTRAINT IF EXISTS "clients_cnpj_format";

ALTER TABLE "clients"
  ADD CONSTRAINT "clients_cnpj_format" CHECK (cnpj IS NULL OR cnpj ~ '^[0-9]{14}$');