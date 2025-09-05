@echo off
echo 🚀 Inicializando Fiber Beauty System...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

echo ✅ Docker está rodando

REM Verificar se docker-compose existe
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose não encontrado. Tentando usar 'docker compose'...
    set DOCKER_COMPOSE_CMD=docker compose
) else (
    set DOCKER_COMPOSE_CMD=docker-compose
)

echo ✅ Docker Compose encontrado

REM Parar containers existentes
echo 🔄 Parando containers existentes...
%DOCKER_COMPOSE_CMD% down

REM Limpar volumes órfãos
echo 🧹 Limpando volumes órfãos...
docker volume prune -f

REM Construir e iniciar containers
echo 🏗️  Construindo e iniciando containers...
%DOCKER_COMPOSE_CMD% up --build -d

REM Aguardar alguns segundos para os containers inicializarem
echo ⏳ Aguardando inicialização dos serviços...
timeout /t 10 /nobreak >nul

REM Verificar status dos containers
echo 📊 Status dos containers:
%DOCKER_COMPOSE_CMD% ps

REM Verificar se o banco está acessível e executar migrações
echo 🔍 Aguardando banco de dados e executando migrações...
timeout /t 15 /nobreak >nul

echo 🔄 Executando migrações do banco de dados...
docker exec fiberbeauty-backend-1 npx prisma migrate deploy

echo 🌱 Executando seed do banco de dados...
docker exec fiberbeauty-backend-1 npm run seed

echo.
echo 🎉 Fiber Beauty System iniciado com sucesso!
echo.
echo 📱 Acesse a aplicação em:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 👤 Usuários de teste:
echo    Admin: admin / 123456
echo    Atendente: maria.silva / 123456
echo.
echo 🔧 Comandos úteis:
echo    Ver logs: %DOCKER_COMPOSE_CMD% logs -f
echo    Parar: %DOCKER_COMPOSE_CMD% down
echo    Reiniciar: %DOCKER_COMPOSE_CMD% restart
echo.
echo 📖 Para mais informações, consulte o README.md
echo.
pause
