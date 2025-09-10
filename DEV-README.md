# 🚀 Desenvolvimento Local - Fiber Beauty

## 📋 **Configuração para Desenvolvimento Local**

### **⚡ Início Rápido**

1. **Execute o script automatizado:**
```bash
start-dev.bat
```

Este script irá:
- ✅ Verificar e instalar dependências
- ✅ Iniciar o backend em `http://localhost:3001`
- ✅ Iniciar o frontend em `http://localhost:3000`
- ✅ Configurar CORS automaticamente

### **🔧 Configuração Manual**

#### **Backend (Terminal 1):**
```bash
cd backend
npm start
```

#### **Frontend (Terminal 2):**
```bash
cd frontend  
npm start
```

### **🌐 URLs de Desenvolvimento**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Backend Health:** http://localhost:3001/api/health

### **🔒 Login de Teste**

- **Usuário:** admin
- **Senha:** admin123

### **📁 Arquivos de Configuração**

#### **Frontend:**
- `.env.local` → Desenvolvimento (localhost:3001)
- `.env` → Produção (Vercel)

#### **Backend:**
- `.env.local` → Desenvolvimento (Supabase + localhost)
- `.env` → Produção (Vercel)

### **🚫 Problemas Comuns**

#### **Erro de CORS:**
- ✅ Certifique-se que `.env.local` existe no frontend
- ✅ Verifique se o backend está rodando na porta 3001

#### **Erro de Banco:**
- ✅ Verificar conexão com Supabase
- ✅ Confirmar DATABASE_URL no `.env.local` do backend

#### **Porta em uso:**
```bash
# Matar processo na porta 3001 (Backend)
npx kill-port 3001

# Matar processo na porta 3000 (Frontend)
npx kill-port 3000
```

### **📦 Deploy vs Desenvolvimento**

| Ambiente | Frontend | Backend | Banco |
|----------|----------|---------|-------|
| **Local** | localhost:3000 | localhost:3001 | Supabase |
| **Produção** | vercel.app | vercel.app | Supabase |

### **🔄 Workflow Recomendado**

1. **Desenvolvimento Local:**
   - Use `start-dev.bat` para testar mudanças
   - Ambos frontend e backend em localhost

2. **Deploy para Produção:**
   - Commit e push para GitHub
   - Deploy automático no Vercel
   - URLs de produção ativas

### **⚠️ Importante**

- **NÃO** commitar arquivos `.env.local`
- **SEMPRE** testar localmente antes do deploy
- **USAR** as URLs corretas para cada ambiente
