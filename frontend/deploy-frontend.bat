@echo off
echo ===================================
echo 🎨 FIBER BEAUTY - DEPLOY FRONTEND
echo ===================================
echo.

echo ✅ Verificando dependências...
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
) else (
    echo ✅ Dependências já instaladas!
)

echo.
echo 🔧 Fazendo build do frontend...
npm run build

echo.
echo 🚀 Iniciando deploy do FRONTEND...
echo Projeto: fiberbeauty-frontend
echo Backend: https://fiberbeauty-backend.vercel.app/api
echo.

vercel --prod --name fiberbeauty-frontend

echo.
echo 🎉 FRONTEND DEPLOYADO!
echo.
echo 📋 PRÓXIMO PASSO:
echo 1. Anote a URL do frontend que apareceu acima
echo 2. Configure as variáveis de ambiente no Vercel Dashboard
echo 3. Teste a aplicação completa
echo.
echo 🌐 Acesse: https://vercel.com/dashboard
echo.

pause
