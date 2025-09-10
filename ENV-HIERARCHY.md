# 📋 Hierarquia de Arquivos de Ambiente - Fiber Beauty

## 🔄 **Como o React Carrega os Arquivos .env**

O React segue esta **ordem de prioridade** (do mais importante para o menos importante):

1. `.env.local` → **SEMPRE** carregado (desenvolvimento/produção)
2. `.env.development` ou `.env.production` → Baseado no NODE_ENV
3. `.env` → Carregado por último (fallback)

## 📁 **Estrutura dos Arquivos**

### **Frontend:**
```
frontend/
├── .env.local          # 🔹 DESENVOLVIMENTO (localhost:3001)
├── .env.production     # 🔸 PRODUÇÃO (vercel.app)  
├── .env                # 🔹 FALLBACK (vercel.app)
└── .env.production.example # 📝 TEMPLATE
```

### **Backend:**
```
backend/
├── .env.local          # 🔹 DESENVOLVIMENTO (Supabase)
├── .env.production     # 🔸 PRODUÇÃO (Supabase)
├── .env                # 🔹 FALLBACK (Local PostgreSQL)
└── .env.production.example # 📝 TEMPLATE
```

## ⚡ **Como Funciona**

### **🖥️ Desenvolvimento Local (`npm start`):**
1. React carrega `.env.local` → `REACT_APP_API_URL=http://localhost:3001/api`
2. Backend usa `.env.local` → `DATABASE_URL=supabase` + `PORT=3001`
3. **Resultado:** Frontend conecta no backend local (localhost:3001)

### **🌐 Produção Vercel:**
1. React carrega `.env.production` → `REACT_APP_API_URL=https://fiberbeauty-backend.vercel.app/api`
2. Backend usa variáveis do Vercel → `DATABASE_URL=supabase` + `PORT=3000`
3. **Resultado:** Frontend conecta no backend de produção

## 🚫 **Arquivos no .gitignore**

```gitignore
.env.local      # ✅ NÃO enviado para Git
.env.current    # ✅ NÃO enviado para Git
.env.deploy     # ✅ NÃO enviado para Git
.env            # ✅ ENVIADO para Git (só fallback)
```

## 🎯 **Comandos por Ambiente**

### **Desenvolvimento:**
```bash
# Frontend automaticamente usa .env.local
npm start    # → http://localhost:3000 → http://localhost:3001/api

# Backend automaticamente usa .env.local  
npm start    # → localhost:3001 + Supabase DB
```

### **Produção:**
```bash
# Frontend automaticamente usa .env.production
npm run build    # → vercel.app → vercel.app/api

# Deploy
vercel --prod    # → Usa variáveis do painel Vercel
```

## 🔧 **Configuração Manual no Vercel**

Se precisar atualizar no painel do Vercel:

1. **Acesse:** https://vercel.com/dashboard
2. **Projeto:** fiberbeauty-frontend / fiberbeauty-backend
3. **Settings > Environment Variables**
4. **Adicionar/Editar:**
   - `REACT_APP_API_URL`
   - `DATABASE_URL`
   - `JWT_SECRET`

## ✅ **Verificação Rápida**

### **Conferir se está funcionando:**

1. **Backend Local:**
   ```
   http://localhost:3001/api/health
   ```

2. **Frontend Local:**
   ```
   http://localhost:3000
   ```

3. **Console do navegador deve mostrar:**
   ```
   Conectando em: http://localhost:3001/api ✅
   ```

4. **SEM erro de CORS** ✅

## 🚨 **Troubleshooting**

### **Erro: Still connecting to Vercel**
- ✅ Verificar se `.env.local` existe no frontend
- ✅ Confirmar `REACT_APP_API_URL=http://localhost:3001/api`

### **Erro: CORS**
- ✅ Backend deve estar rodando em `localhost:3001`
- ✅ Verificar `FRONTEND_URL=http://localhost:3000` no backend

### **Erro: Database**
- ✅ Confirmar `DATABASE_URL` do Supabase no `.env.local` do backend
