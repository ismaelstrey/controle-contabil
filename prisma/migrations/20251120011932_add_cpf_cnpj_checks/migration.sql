-- Constraints for CPF/CNPJ exclusivity and format
ALTER TABLE "clients"
  ADD CONSTRAINT "clients_no_both_cpf_cnpj" CHECK (NOT (cpf IS NOT NULL AND cnpj IS NOT NULL)),
  ADD CONSTRAINT "clients_cpf_format" CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$'),
  ADD CONSTRAINT "clients_cnpj_format" CHECK (cnpj IS NULL OR cnpj ~ '^[0-9]{14}$');