@echo off
echo 🚀 Iniciando Fiber Beauty em modo desenvolvimento...
echo.

echo 📁 Verificando diretórios...
if not exist "backend\node_modules" (
    echo ⚠️  Backend: node_modules não encontrado. Instalando dependências...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo ⚠️  Frontend: node_modules não encontrado. Instalando dependências...
    cd frontend
    npm install
    cd ..
)

echo.
echo 🔧 Iniciando serviços em desenvolvimento...
echo 📍 Backend: http://localhost:3001
echo 📍 Frontend: http://localhost:3000
echo.

echo 🔌 Iniciando Backend (localhost:3001)...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo 🎨 Iniciando Frontend (localhost:3000)...
start cmd /k "cd frontend && npm start"

echo.
echo ✅ Serviços iniciados com sucesso!
echo 🌐 Acesse: http://localhost:3000
echo.
pause
