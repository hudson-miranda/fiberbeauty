#!/bin/bash

# Fiber Beauty - Deploy Script para Vercel + Supabase
echo "🚀 Iniciando deploy do Fiber Beauty..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se estamos logados no Vercel
echo "📝 Verificando login no Vercel..."
vercel whoami

# Deploy do Backend
echo "🔧 Fazendo deploy do backend..."
cd backend
vercel --prod

# Capturar URL do backend
BACKEND_URL=$(vercel ls | grep beauty-salon-backend | head -1 | awk '{print $2}')
echo "✅ Backend deployado em: $BACKEND_URL"

# Deploy do Frontend
echo "🎨 Fazendo deploy do frontend..."
cd ../frontend

# Configurar variável de ambiente do frontend
echo "REACT_APP_API_URL=https://$BACKEND_URL/api" > .env.production

vercel --prod

# Capturar URL do frontend
FRONTEND_URL=$(vercel ls | grep beauty-salon-frontend | head -1 | awk '{print $2}')
echo "✅ Frontend deployado em: $FRONTEND_URL"

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "🌐 Frontend: https://$FRONTEND_URL"
echo "🔧 Backend: https://$BACKEND_URL"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no painel do Vercel"
echo "2. Execute o script SQL no Supabase"
echo "3. Teste a aplicação"
