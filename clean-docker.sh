#!/bin/bash

# Script para limpeza completa do Docker
echo "🧹 Limpeza completa do Docker para Fiber Beauty System..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "✅ Docker está rodando"

# Verificar se docker-compose existe
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# Parar e remover todos os containers do projeto
echo "🛑 Parando e removendo containers do projeto..."
$DOCKER_COMPOSE_CMD down -v --remove-orphans

# Remover imagens do projeto
echo "🗑️ Removendo imagens do projeto..."
docker rmi fichaatendimento-frontend:latest 2>/dev/null || true
docker rmi fichaatendimento-backend:latest 2>/dev/null || true
docker rmi postgres:15-alpine 2>/dev/null || true

# Limpeza completa do Docker
echo "🧹 Limpeza completa do sistema Docker..."
docker system prune -a -f
docker builder prune -a -f
docker volume prune -f
docker network prune -f

# Remover containers parados
echo "🗑️ Removendo containers parados..."
docker container prune -f

echo ""
echo "✅ Limpeza completa concluída!"
echo "Agora você pode executar o start.sh novamente."
