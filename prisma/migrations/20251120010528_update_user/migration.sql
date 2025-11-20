/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "cnpj" CHAR(14),
ADD COLUMN     "codigo_acesso" TEXT,
ADD COLUMN     "codigo_regularize" TEXT,
ADD COLUMN     "cpf" CHAR(11),
ADD COLUMN     "data_nascimento" TIMESTAMP(3),
ADD COLUMN     "senha_gov" TEXT,
ADD COLUMN     "senha_nfse" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");

-- CreateIndex
CREATE INDEX "clients_cpf_idx" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_cnpj_idx" ON "clients"("cnpj");
