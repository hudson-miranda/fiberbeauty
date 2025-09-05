#!/bin/bash

# Script para inicializar o Fiber Beauty System
echo "🚀 Inicializando Fiber Beauty System..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

echo "✅ Docker está rodando"

# Verificar se docker-compose existe
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado. Tentando usar 'docker compose'..."
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo "✅ Docker Compose encontrado"

# Parar containers existentes
echo "🔄 Parando containers existentes..."
$DOCKER_COMPOSE_CMD down

# Limpar cache do Docker para evitar problemas de build
echo "🧹 Limpando cache do Docker..."
docker system prune -f
docker builder prune -f

# Limpar volumes órfãos (opcional)
echo "🧹 Limpando volumes órfãos..."
docker volume prune -f

# Remover imagens antigas do projeto
echo "🗑️ Removendo imagens antigas do projeto..."
docker rmi fichaatendimento-frontend:latest 2>/dev/null || true
docker rmi fichaatendimento-backend:latest 2>/dev/null || true

# Construir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
if ! $DOCKER_COMPOSE_CMD up --build -d; then
    echo "❌ Erro no build. Tentando build limpo..."
    
    # Build limpo sem cache
    echo "🔄 Fazendo build sem cache..."
    $DOCKER_COMPOSE_CMD build --no-cache
    
    # Tentar subir novamente
    if ! $DOCKER_COMPOSE_CMD up -d; then
        echo "❌ Falha ao iniciar containers. Verifique os logs:"
        $DOCKER_COMPOSE_CMD logs
        exit 1
    fi
fi

# Aguardar alguns segundos para os containers inicializarem
echo "⏳ Aguardando inicialização dos serviços..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
$DOCKER_COMPOSE_CMD ps

# Verificar se o banco está acessível
echo "🔍 Verificando conectividade com o banco de dados..."
for i in {1..30}; do
    if docker exec beauty_salon_backend npx prisma db pull > /dev/null 2>&1; then
        echo "✅ Banco de dados está acessível"
        break
    else
        echo "⏳ Aguardando banco de dados... (tentativa $i/30)"
        sleep 2
    fi
done

# Executar migrações do Prisma
echo "🔄 Executando migrações do banco de dados..."
docker exec beauty_salon_backend npx prisma migrate deploy

# Executar seed do banco (dados iniciais)
echo "🌱 Executando seed do banco de dados..."
docker exec beauty_salon_backend npm run seed

echo ""
echo "🎉 Fiber Beauty System iniciado com sucesso!"
echo ""
echo "📱 Acesse a aplicação em:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo ""
echo "🔧 Comandos úteis:"
echo "   Ver logs: $DOCKER_COMPOSE_CMD logs -f"
echo "   Parar: $DOCKER_COMPOSE_CMD down"
echo "   Reiniciar: $DOCKER_COMPOSE_CMD restart"
echo ""
echo "📖 Para mais informações, consulte o README.md"
