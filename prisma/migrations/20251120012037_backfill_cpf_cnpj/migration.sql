-- Backfill new cpf/cnpj fields from legacy cpf_cnpj
UPDATE "clients"
SET cpf = REGEXP_REPLACE("cpf_cnpj", '\\D', '', 'g')
WHERE cpf IS NULL AND LENGTH(REGEXP_REPLACE("cpf_cnpj", '\\D', '', 'g')) = 11;

UPDATE "clients"
SET cnpj = REGEXP_REPLACE("cpf_cnpj", '\\D', '', 'g')
WHERE cnpj IS NULL AND LENGTH(REGEXP_REPLACE("cpf_cnpj", '\\D', '', 'g')) = 14;