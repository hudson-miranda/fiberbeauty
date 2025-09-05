@echo off
echo 🚀 Iniciando deploy do Fiber Beauty...

REM Verificar se Vercel CLI está instalado
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI não encontrado. Instalando...
    npm install -g vercel
)

REM Verificar se estamos logados no Vercel
echo 📝 Verificando login no Vercel...
vercel whoami

REM Deploy do Backend
echo 🔧 Fazendo deploy do backend...
cd backend
vercel --prod

echo ✅ Backend deployado! Verifique a URL no dashboard do Vercel.

REM Deploy do Frontend
echo 🎨 Fazendo deploy do frontend...
cd ..\frontend
vercel --prod

echo ✅ Frontend deployado! Verifique a URL no dashboard do Vercel.

echo.
echo 🎉 Deploy concluído com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Configure as variáveis de ambiente no painel do Vercel
echo 2. Execute o script SQL no Supabase
echo 3. Teste a aplicação

pause
