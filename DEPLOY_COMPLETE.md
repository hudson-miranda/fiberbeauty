# 🚀 Fiber Beauty - Deploy Guide (Vercel + Supabase)

## 📋 **Pré-requisitos**
- ✅ Conta no Vercel (vercel.com)
- ✅ Conta no Supabase (supabase.com)
- ✅ GitHub: hudson-miranda

## 🎯 **Deploy Automatizado - Opção Recomendada**

### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Login no Vercel**
```bash
vercel login
```

### 3. **Executar Deploy**
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

---

## 🔧 **Deploy Manual Passo-a-Passo**

### **Fase 1: Configurar Supabase**

1. **Acesse seu Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Crie um novo projeto ou use existente

2. **Executar Script SQL**
   - Vá para "SQL Editor"
   - Cole o conteúdo do arquivo `supabase-setup.sql`
   - Execute o script

3. **Capturar Informações de Conexão**
   - Vá para "Settings" > "Database"
   - Copie a **Connection String** (URI)
   - Formato: `postgresql://[user]:[password]@[host]:[port]/[database]`

### **Fase 2: Deploy do Backend (API)**

1. **Preparar Backend**
```bash
cd backend
```

2. **Deploy no Vercel**
```bash
vercel --prod
```

3. **Configurar Variáveis de Ambiente**
   - Acesse o dashboard do Vercel
   - Vá para o projeto do backend
   - Settings > Environment Variables
   - Adicione as seguintes variáveis:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true&connection_limit=1
JWT_SECRET=96b5f55a256eeacec5e475323c1fb1549dc72e0ab04d7479f409342c7e27f20b7743f76df384ecdd5108655bc545026dcb4acd08e0db32612ed512f399dcb83a
JWT_EXPIRES_IN=7d
NODE_ENV=production
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
FRONTEND_URL=https://[seu-frontend].vercel.app
PRISMA_CLI_QUERY_ENGINE_TYPE=binary
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Fazer Redeploy**
```bash
vercel --prod
```

### **Fase 3: Deploy do Frontend**

1. **Preparar Frontend**
```bash
cd ../frontend
```

2. **Deploy no Vercel**
```bash
vercel --prod
```

3. **Configurar Variáveis de Ambiente**
   - No dashboard do Vercel (projeto frontend)
   - Settings > Environment Variables
   - Adicione:

```env
REACT_APP_API_URL=https://[seu-backend].vercel.app/api
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

4. **Fazer Redeploy**
```bash
vercel --prod
```

---

## ✅ **Informações Importantes**

### **URLs Geradas**
- **Frontend**: `https://[projeto-nome].vercel.app`
- **Backend**: `https://[backend-nome].vercel.app`

### **Login Padrão**
- **Usuário**: `admin`
- **Senha**: `admin123`

### **JWT Secret Gerado**
```
96b5f55a256eeacec5e475323c1fb1549dc72e0ab04d7479f409342c7e27f20b7743f76df384ecdd5108655bc545026dcb4acd08e0db32612ed512f399dcb83a
```

---

## 🔍 **Verificação do Deploy**

### **Testes Backend**
```bash
curl https://[seu-backend].vercel.app/api/health
```

### **Testes Frontend**
- Acesse: `https://[seu-frontend].vercel.app`
- Faça login com admin/admin123
- Teste navegação entre páginas

---

## 📦 **Arquivos de Configuração Criados**

- ✅ `supabase-setup.sql` - Script de criação do banco
- ✅ `backend/.env.production.example` - Variáveis do backend
- ✅ `frontend/.env.production.example` - Variáveis do frontend
- ✅ `backend/vercel.json` - Configuração Vercel backend
- ✅ `deploy.sh` / `deploy.bat` - Scripts automatizados

---

## 🚨 **Troubleshooting**

### **Problema: Backend não conecta com Supabase**
- Verifique se a CONNECTION_STRING está correta
- Confirme se o script SQL foi executado
- Teste conexão no Supabase Query Editor

### **Problema: Frontend não conecta com Backend**
- Verifique se REACT_APP_API_URL está correto
- Confirme se backend está online
- Verifique CORS no backend

### **Problema: Deploy falha**
- Verifique se Vercel CLI está atualizado
- Confirme login no Vercel
- Verifique logs de build no dashboard

---

## 💰 **Custos Estimados**
- **Vercel**: Gratuito (até 100GB bandwidth)
- **Supabase**: Gratuito (até 2 projetos, 500MB DB)
- **Total**: **R$ 0,00/mês** para uso inicial

## 📞 **Próximos Passos**
1. Execute o deploy seguindo este guide
2. Teste todas as funcionalidades
3. Configure domínio personalizado (opcional)
4. Configure CI/CD automático via GitHub
