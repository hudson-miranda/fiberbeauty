@echo off
echo =================================
echo 🚀 FIBER BEAUTY - DEPLOY BACKEND
echo =================================
echo.

echo ✅ Verificando Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI não encontrado. Instalando...
    npm install -g vercel
    echo ✅ Vercel CLI instalado!
) else (
    echo ✅ Vercel CLI já está instalado!
)

echo.
echo 📝 Verificando login no Vercel...
vercel whoami

echo.
echo 🔧 Iniciando deploy do BACKEND...
echo Projeto: fiberbeauty-backend
echo.

vercel --prod --name fiberbeauty-backend

echo.
echo 🎯 BACKEND DEPLOYADO!
echo.
echo 📋 PRÓXIMO PASSO:
echo 1. Anote a URL do backend que apareceu acima
echo 2. Configure as variáveis de ambiente no Vercel Dashboard
echo 3. Execute o script SQL no Supabase
echo.
echo 🌐 Acesse: https://vercel.com/dashboard
echo.

pause
