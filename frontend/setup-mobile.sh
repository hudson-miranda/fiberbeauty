#!/bin/bash

# Fiber Beauty - Mobile App Setup Script
echo "📱 Fiber Beauty - Configurando App Mobile com Capacitor..."

# Verificar se estamos na pasta frontend
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na pasta frontend"
    exit 1
fi

echo "✅ Pasta frontend detectada"

# Instalar Capacitor
echo "📦 Instalando Capacitor..."
npm install @capacitor/core @capacitor/cli

# Instalar plugins essenciais
echo "🔌 Instalando plugins essenciais..."
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/device @capacitor/network @capacitor/app @capacitor/keyboard

# Verificar se capacitor.config.ts existe
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚠️  capacitor.config.ts não encontrado. Criando..."
    # O arquivo já foi criado anteriormente
fi

# Inicializar Capacitor
echo "🚀 Inicializando Capacitor..."
npx cap init "Fiber Beauty" "com.fiberbeauty.app" --web-dir="build"

# Fazer build da aplicação
echo "🏗️  Fazendo build da aplicação..."
npm run build

# Adicionar plataformas
echo "📱 Adicionando plataformas mobile..."
npx cap add ios
npx cap add android

# Sincronizar
echo "🔄 Sincronizando com plataformas..."
npx cap sync

echo "✅ Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Para iOS: npx cap open ios (requer Mac + Xcode)"
echo "2. Para Android: npx cap open android (requer Android Studio)"
echo "3. Para testar: npx cap run ios ou npx cap run android"
echo ""
echo "📚 Consulte o arquivo MOBILE_APP_GUIDE.md para mais detalhes"
