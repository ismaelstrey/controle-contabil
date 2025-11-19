-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('MEI', 'EI', 'LTDA', 'SLU', 'SA', 'SociedadeSimples', 'Cooperativa');

-- CreateEnum
CREATE TYPE "CompanyPorte" AS ENUM ('ME', 'EPP', 'Media', 'Grande');

-- CreateEnum
CREATE TYPE "RegimeTributario" AS ENUM ('SimplesNacional', 'LucroPresumido', 'LucroReal');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT,
    "tipoEmpresa" "CompanyType",
    "porte" "CompanyPorte",
    "regimeTributario" "RegimeTributario",
    "cnaePrincipal" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_sync_at" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "das_periods" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "situacao" TEXT,
    "apurado" TEXT,
    "principal" DOUBLE PRECISION,
    "multas" DOUBLE PRECISION,
    "juros" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "data_vencimento" TIMESTAMP(3),
    "data_acolhimento" TIMESTAMP(3),
    "data_pagamento" TIMESTAMP(3),
    "icms" DOUBLE PRECISION,
    "iss" DOUBLE PRECISION,
    "inss" DOUBLE PRECISION,
    "numeroApuracao" TEXT,
    "numeroDas" TEXT,
    "codigo_barras" TEXT,
    "url_das" TEXT,
    "mensagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "das_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE INDEX "companies_user_id_idx" ON "companies"("user_id");

-- CreateIndex
CREATE INDEX "das_periods_company_id_idx" ON "das_periods"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "das_periods_company_id_periodo_key" ON "das_periods"("company_id", "periodo");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "das_periods" ADD CONSTRAINT "das_periods_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
