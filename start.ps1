# PowerShell script para inicializar o Fiber Beauty System
Write-Host "Inicializando Fiber Beauty System..." -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se docker-compose existe
$dockerComposeCmd = "docker-compose"
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "docker-compose não encontrado. Tentando usar 'docker compose'..." -ForegroundColor Yellow
    $dockerComposeCmd = "docker compose"
}

Write-Host "Docker Compose encontrado" -ForegroundColor Green

# Parar containers existentes
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
& $dockerComposeCmd down

# Limpar cache do Docker para evitar problemas de build
Write-Host "Limpando cache do Docker..." -ForegroundColor Yellow
docker system prune -f
docker builder prune -f

# Limpar volumes órfãos
Write-Host "Limpando volumes órfãos..." -ForegroundColor Yellow
docker volume prune -f

# Remover imagens antigas do projeto
Write-Host "Removendo imagens antigas do projeto..." -ForegroundColor Yellow
docker rmi fichaatendimento-frontend:latest 2>$null
docker rmi fichaatendimento-backend:latest 2>$null

# Construir e iniciar containers
Write-Host "Construindo e iniciando containers..." -ForegroundColor Yellow
$buildResult = & $dockerComposeCmd up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build. Tentando build limpo..." -ForegroundColor Red
    
    # Build limpo sem cache
    Write-Host "Fazendo build sem cache..." -ForegroundColor Yellow
    & $dockerComposeCmd build --no-cache
    
    # Tentar subir novamente
    $startResult = & $dockerComposeCmd up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Falha ao iniciar containers. Verifique os logs:" -ForegroundColor Red
        & $dockerComposeCmd logs
        exit 1
    }
}

# Aguardar alguns segundos para os containers inicializarem
Write-Host "Aguardando inicialização dos serviços..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "Status dos containers:" -ForegroundColor Cyan
& $dockerComposeCmd ps

# Verificar se o banco está acessível
Write-Host "Verificando conectividade com o banco de dados..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    $dbCheck = docker exec beauty_salon_backend npx prisma db pull 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Banco de dados está acessível" -ForegroundColor Green
        break
    } else {
        Write-Host "Aguardando banco de dados... (tentativa $i/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

# Executar migrações do Prisma
Write-Host "Executando migrações do banco de dados..." -ForegroundColor Yellow
docker exec beauty_salon_backend npx prisma migrate deploy

# Executar seed do banco (dados iniciais)
Write-Host "Executando seed do banco de dados..." -ForegroundColor Yellow
docker exec beauty_salon_backend npm run seed

Write-Host ""
Write-Host "Fiber Beauty System iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse a aplicação em:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Usuários de teste:" -ForegroundColor Cyan
Write-Host "   Admin: admin / 123456" -ForegroundColor White
Write-Host "   Atendente: maria.silva / 123456" -ForegroundColor White
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs: $dockerComposeCmd logs -f" -ForegroundColor White
Write-Host "   Parar: $dockerComposeCmd down" -ForegroundColor White
Write-Host "   Reiniciar: $dockerComposeCmd restart" -ForegroundColor White
Write-Host ""
Write-Host "Para mais informações, consulte o README.md" -ForegroundColor Cyan
