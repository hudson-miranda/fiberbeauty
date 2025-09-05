# PowerShell script para limpeza completa do Docker
Write-Host "🧹 Limpeza completa do Docker para Fiber Beauty System..." -ForegroundColor Yellow

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Host "✅ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker primeiro." -ForegroundColor Red
    exit 1
}

# Parar e remover todos os containers do projeto
Write-Host "🛑 Parando e removendo containers do projeto..." -ForegroundColor Yellow
docker-compose down -v --remove-orphans

# Remover imagens do projeto
Write-Host "🗑️ Removendo imagens do projeto..." -ForegroundColor Yellow
docker rmi fichaatendimento-frontend:latest 2>$null
docker rmi fichaatendimento-backend:latest 2>$null
docker rmi postgres:15-alpine 2>$null

# Limpeza completa do Docker
Write-Host "🧹 Limpeza completa do sistema Docker..." -ForegroundColor Yellow
docker system prune -a -f
docker builder prune -a -f
docker volume prune -f
docker network prune -f

# Remover containers parados
Write-Host "🗑️ Removendo containers parados..." -ForegroundColor Yellow
docker container prune -f

Write-Host ""
Write-Host "✅ Limpeza completa concluída!" -ForegroundColor Green
Write-Host "Agora você pode executar o start.ps1 novamente." -ForegroundColor Cyan
