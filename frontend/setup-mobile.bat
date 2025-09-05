@echo off
REM Fiber Beauty - Mobile App Setup Script
echo 📱 Fiber Beauty - Configurando App Mobile com Capacitor...

REM Verificar se estamos na pasta frontend
if not exist "package.json" (
    echo ❌ Execute este script na pasta frontend
    exit /b 1
)

echo ✅ Pasta frontend detectada

REM Instalar Capacitor
echo 📦 Instalando Capacitor...
call npm install @capacitor/core @capacitor/cli

REM Instalar plugins essenciais
echo 🔌 Instalando plugins essenciais...
call npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/device @capacitor/network @capacitor/app @capacitor/keyboard

REM Inicializar Capacitor
echo 🚀 Inicializando Capacitor...
call npx cap init "Fiber Beauty" "com.fiberbeauty.app" --web-dir="build"

REM Fazer build da aplicação
echo 🏗️  Fazendo build da aplicação...
call npm run build

REM Adicionar plataformas
echo 📱 Adicionando plataformas mobile...
call npx cap add ios
call npx cap add android

REM Sincronizar
echo 🔄 Sincronizando com plataformas...
call npx cap sync

echo ✅ Setup concluído!
echo.
echo 📋 Próximos passos:
echo 1. Para iOS: npx cap open ios (requer Mac + Xcode)
echo 2. Para Android: npx cap open android (requer Android Studio)
echo 3. Para testar: npx cap run ios ou npx cap run android
echo.
echo 📚 Consulte o arquivo MOBILE_APP_GUIDE.md para mais detalhes

pause
