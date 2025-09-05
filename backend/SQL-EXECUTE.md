# 🎯 BACKEND CORRIGIDO - EXECUTE O SCRIPT SQL

## ✅ **Backend Funcionando:**
- **Status**: ✅ Online e funcionando
- **Prisma**: ✅ Corrigido
- **CORS**: ✅ Corrigido
- **URL**: https://fiberbeauty-backend.vercel.app

---

## 🗄️ **EXECUTE O SCRIPT SQL NO SUPABASE AGORA**

### **1. Acesse o Supabase:**
🌐 https://supabase.com/dashboard

### **2. Selecione o projeto "fiberbeauty"**

### **3. Vá para "SQL Editor"**

### **4. Cole e execute este script:**

```sql
-- Fiber Beauty - Script SQL para Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles de usuário
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'ATTENDANT');

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
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- Tabela de atendimentos
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "clientId" TEXT NOT NULL,
    "attendantId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- Tabela de avaliações NPS
CREATE TABLE "nps_ratings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "attendanceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nps_ratings_pkey" PRIMARY KEY ("id")
);

-- Tabela de notificações
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Índices únicos
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");
CREATE UNIQUE INDEX "nps_ratings_attendanceId_key" ON "nps_ratings"("attendanceId");

-- Chaves estrangeiras
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_formId_fkey" FOREIGN KEY ("formId") REFERENCES "attendance_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_formId_fkey" FOREIGN KEY ("formId") REFERENCES "attendance_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
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
VALUES ('Administrador', 'admin', '$2b$10$rOQKQzW4xJQnOgJJZQ2QH.ZFOXb1aaOV1WJ6t3Fg5nJfKj3YHLQpO', 'ADMIN');

-- Formulário padrão de atendimento
INSERT INTO "attendance_forms" ("name", "description") 
VALUES ('Ficha de Atendimento Padrão', 'Formulário básico para atendimento de unhas');

-- Campos do formulário padrão
INSERT INTO "form_fields" ("formId", "label", "type", "required", "order") 
SELECT 
    id,
    'Observações Gerais',
    'textarea',
    false,
    1
FROM "attendance_forms" 
WHERE "name" = 'Ficha de Atendimento Padrão';
```

---

## 🔍 **APÓS EXECUTAR O SCRIPT:**

1. **Teste o login**: https://fiberbeauty-frontend.vercel.app
2. **Usuário**: `admin`
3. **Senha**: `admin123`

## 📞 **Me avise quando terminar:**
- ✅ Script executado no Supabase
- ✅ Teste de login funcionando

**Execute o script e me confirme! 🚀**
