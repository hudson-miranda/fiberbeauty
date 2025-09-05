-- Fiber Beauty - Script SQL ATUALIZADO para Supabase
-- Execute este script no SQL Editor do Supabase para corrigir o schema

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Primeiro, vamos deletar todas as tabelas existentes para recriar corretamente
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "nps_ratings" CASCADE;
DROP TABLE IF EXISTS "attendances" CASCADE;
DROP TABLE IF EXISTS "form_fields" CASCADE;
DROP TABLE IF EXISTS "attendance_forms" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Deletar enums existentes
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "AttendanceStatus" CASCADE;
DROP TYPE IF EXISTS "FieldType" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "NPSCategory" CASCADE;

-- Criar enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ATTENDANT');
CREATE TYPE "AttendanceStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'NUMBER', 'DATE', 'TIME', 'EMAIL', 'PHONE');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');
CREATE TYPE "NPSCategory" AS ENUM ('DETRACTOR', 'NEUTRAL', 'PROMOTER');

-- Tabela de usuários
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ATTENDANT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Tabela de clientes
CREATE TABLE "clients" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "birthDate" DATE,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- Tabela de formulários de atendimento
CREATE TABLE "attendance_forms" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_forms_pkey" PRIMARY KEY ("id")
);

-- Tabela de campos de formulário
CREATE TABLE "form_fields" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "validation" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendanceFormId" TEXT NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- Tabela de atendimentos
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "attendanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "responses" JSONB NOT NULL,
    "signature" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceFormId" TEXT NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- Tabela de avaliações NPS
CREATE TABLE "nps_ratings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "category" "NPSCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendanceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "nps_ratings_pkey" PRIMARY KEY ("id")
);

-- Tabela de notificações
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Índices únicos
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");
CREATE UNIQUE INDEX "nps_ratings_attendanceId_key" ON "nps_ratings"("attendanceId");

-- Chaves estrangeiras
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_attendanceFormId_fkey" FOREIGN KEY ("attendanceFormId") REFERENCES "attendance_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendanceFormId_fkey" FOREIGN KEY ("attendanceFormId") REFERENCES "attendance_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "nps_ratings" ADD CONSTRAINT "nps_ratings_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "nps_ratings" ADD CONSTRAINT "nps_ratings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON "clients" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_forms_updated_at BEFORE UPDATE ON "attendance_forms" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_fields_updated_at BEFORE UPDATE ON "form_fields" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON "attendances" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nps_ratings_updated_at BEFORE UPDATE ON "nps_ratings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON "notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais
-- Usuário admin padrão (senha: admin123)
INSERT INTO "users" ("name", "username", "password", "role") 
VALUES ('Administrador', 'admin', '$2a$10$hKJ6vAJEro372vIAjqnEo.RtboEenuruCkizYmyZzLaOPWPSSJ2cy', 'ADMIN');

-- Formulário padrão de atendimento
INSERT INTO "attendance_forms" ("name", "description") 
VALUES ('Ficha de Atendimento Padrão', 'Formulário básico para atendimento de unhas');

-- Campos do formulário padrão
INSERT INTO "form_fields" ("attendanceFormId", "label", "type", "required", "order") 
SELECT 
    id,
    'Observações Gerais',
    'TEXTAREA',
    false,
    1
FROM "attendance_forms" 
WHERE "name" = 'Ficha de Atendimento Padrão';

-- Cliente de exemplo
INSERT INTO "clients" ("firstName", "lastName", "cpf", "phone") 
VALUES ('Cliente', 'Exemplo', '000.000.000-00', '(11) 99999-9999');

-- Atendimento de exemplo
INSERT INTO "attendances" ("clientId", "userId", "attendanceFormId", "responses") 
SELECT 
    c.id,
    u.id,
    f.id,
    '{"observacoes": "Atendimento de exemplo"}'::jsonb
FROM "clients" c, "users" u, "attendance_forms" f
WHERE c."firstName" = 'Cliente' 
AND u."username" = 'admin' 
AND f."name" = 'Ficha de Atendimento Padrão';

-- NPS Rating de exemplo
INSERT INTO "nps_ratings" ("attendanceId", "clientId", "score", "category", "comment")
SELECT 
    a.id,
    c.id,
    9,
    'PROMOTER',
    'Excelente atendimento!'
FROM "attendances" a, "clients" c
WHERE c."firstName" = 'Cliente';

-- Notificação de exemplo
INSERT INTO "notifications" ("userId", "title", "message", "type")
SELECT 
    id,
    'Bem-vindo ao Sistema',
    'Sistema FiberBeauty configurado com sucesso!',
    'SUCCESS'
FROM "users" 
WHERE "username" = 'admin';

-- Verificar dados criados
SELECT 'Users' as tabela, count(*) as total FROM "users"
UNION ALL
SELECT 'Clients' as tabela, count(*) as total FROM "clients"
UNION ALL
SELECT 'Attendance Forms' as tabela, count(*) as total FROM "attendance_forms"
UNION ALL
SELECT 'Form Fields' as tabela, count(*) as total FROM "form_fields"
UNION ALL
SELECT 'Attendances' as tabela, count(*) as total FROM "attendances"
UNION ALL
SELECT 'NPS Ratings' as tabela, count(*) as total FROM "nps_ratings"
UNION ALL
SELECT 'Notifications' as tabela, count(*) as total FROM "notifications";
