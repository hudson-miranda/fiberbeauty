@echo off
echo 🚀 Fiber Beauty - Deploy Final para Vercel + Supabase
echo.

REM Verificar se Vercel CLI está instalado
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI não encontrado. Instalando...
    npm install -g vercel
)

echo 📝 Fazendo login no Vercel...
vercel login

echo.
echo 🔧 === DEPLOY DO BACKEND ===
cd backend

echo 📦 Fazendo deploy inicial do backend...
vercel --prod

echo.
echo ⚙️ AGORA CONFIGURE AS VARIÁVEIS DE AMBIENTE NO VERCEL:
echo.
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Clique no projeto do backend
echo 3. Vá em Settings ^> Environment Variables
echo 4. Adicione as seguintes variáveis:
echo.
echo DATABASE_URL=postgresql://postgres:FiberBeauty2025@db.gtabnsusqclrlrzzpqjp.supabase.co:5432/postgres?pgbouncer=true^&connection_limit=1
echo JWT_SECRET=96b5f55a256eeacec5e475323c1fb1549dc72e0ab04d7479f409342c7e27f20b7743f76df384ecdd5108655bc545026dcb4acd08e0db32612ed512f399dcb83a
echo JWT_EXPIRES_IN=7d
echo NODE_ENV=production
echo MAX_FILE_SIZE=5242880
echo UPLOAD_PATH=./uploads
echo FRONTEND_URL=https://fiberbeauty.vercel.app
echo PRISMA_CLI_QUERY_ENGINE_TYPE=binary
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
echo.
pause

echo 🔄 Fazendo redeploy do backend com as variáveis...
vercel --prod

echo ✅ Backend configurado! Anote a URL do backend.
echo.

echo 🎨 === DEPLOY DO FRONTEND ===
cd ..\frontend

echo 📦 Fazendo deploy inicial do frontend...
vercel --prod

echo.
echo ⚙️ CONFIGURE A VARIÁVEL DO FRONTEND NO VERCEL:
echo.
echo 1. Acesse: https://vercel.com/dashboard
echo 2. Clique no projeto do frontend
echo 3. Vá em Settings ^> Environment Variables
echo 4. Adicione:
echo.
echo REACT_APP_API_URL=https://[URL-DO-BACKEND]/api
echo REACT_APP_ENVIRONMENT=production
echo GENERATE_SOURCEMAP=false
echo.
pause

echo 🔄 Fazendo redeploy do frontend...
vercel --prod

echo.
echo 🎉 DEPLOY CONCLUÍDO COM SUCESSO!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Execute o script SQL no Supabase (arquivo: supabase-setup.sql)
echo 2. Teste o login: admin / admin123
echo 3. Verifique se tudo está funcionando
echo.

pause
