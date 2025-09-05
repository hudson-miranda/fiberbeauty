# 📱 Fiber Beauty - Guia para Aplicativo Móvel

## 🎯 **Estratégia Recomendada: Capacitor**

### **Por que Capacitor?**
- ✅ Aproveita 90% do código React existente
- ✅ Desenvolvimento rápido (2-3 semanas vs 2-3 meses React Native)
- ✅ Acesso às APIs nativas (câmera, notificações, etc.)
- ✅ Suporte oficial da Ionic Team

## 🚀 **Implementação Passo a Passo**

### **1. Preparar o Projeto Web**

```bash
cd frontend

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli
```

### **2. Configurar Capacitor**

```bash
# Inicializar Capacitor
npx cap init "Fiber Beauty" "com.fiberbeauty.app"

# Adicionar plataformas
npx cap add ios
npx cap add android
```

### **3. Configurar capacitor.config.ts**

```typescript
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.fiberbeauty.app',
  appName: 'Fiber Beauty',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#e5a823',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#e5a823'
    }
  }
};

export default config;
```

### **4. Ajustes no Código React**

#### **A. Instalar plugins necessários:**
```bash
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/device @capacitor/network
```

#### **B. Adaptar App.js:**
```javascript
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Configurar status bar
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#e5a823' });
      
      // Esconder splash screen após carregamento
      SplashScreen.hide();
    }
  }, []);
  
  // Resto do código...
}
```

#### **C. Adaptações de UI para Mobile:**
```javascript
// hooks/useIsMobile.js
import { Capacitor } from '@capacitor/core';

export const useIsMobile = () => {
  return Capacitor.isNativePlatform();
};

// Usar nos componentes:
const isMobile = useIsMobile();

// Ajustar estilos condicionalmente
<div className={`header ${isMobile ? 'mobile-header' : ''}`}>
```

### **5. Build e Deploy**

```bash
# Build da versão web
npm run build

# Sincronizar com plataformas nativas
npx cap sync

# Abrir no IDE nativo
npx cap open ios      # Xcode
npx cap open android  # Android Studio
```

## 📱 **Adaptações Específicas para Mobile**

### **1. Navegação Mobile-Friendly**
```css
/* Adicionar ao index.css */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
```

### **2. Touch Gestures**
```bash
# Instalar plugin de gestos
npm install @capacitor/app
```

### **3. Notificações Push**
```bash
# Para notificações push
npm install @capacitor/push-notifications
```

## 🍎 **Deploy iOS App Store**

### **Pré-requisitos:**
- ✅ Conta Apple Developer ($99/ano)
- ✅ Mac com Xcode
- ✅ Certificados de desenvolvimento

### **Processo:**
1. **Xcode**: Abrir projeto iOS
2. **Configurar**: Bundle ID, versão, ícones
3. **Archive**: Criar build de produção
4. **Upload**: Para App Store Connect
5. **Review**: Aguardar aprovação Apple (2-7 dias)

## 🤖 **Deploy Google Play Store**

### **Pré-requisitos:**
- ✅ Conta Google Play Developer ($25 taxa única)
- ✅ Android Studio

### **Processo:**
1. **Android Studio**: Abrir projeto Android
2. **Generate**: APK/AAB assinado
3. **Upload**: Para Google Play Console
4. **Review**: Aprovação Google (1-3 dias)

## 🎨 **Assets Necessários**

### **Ícones:**
- iOS: 1024x1024 (App Store), múltiplos tamanhos
- Android: 512x512 (Play Store), múltiplos tamanhos

### **Splash Screens:**
- iOS: Múltiplas resoluções
- Android: xxxhdpi, xxhdpi, xhdpi, hdpi, mdpi

### **Screenshots:**
- iPhone: 6.7", 6.5", 5.5"
- iPad: 12.9", 11"
- Android: Phone, 7", 10"

## 💰 **Custos Estimados**

- **Apple Developer**: $99/ano
- **Google Play Developer**: $25 (taxa única)
- **Desenvolvimento**: 2-4 semanas
- **Manutenção**: Atualizações regulares

## ⚡ **Cronograma Estimado**

1. **Semana 1**: Setup Capacitor + Adaptações UI
2. **Semana 2**: Testes + Correções mobile
3. **Semana 3**: Build iOS + Android
4. **Semana 4**: Submissão lojas + Correções

## 🔧 **Alternativas Avançadas**

### **Progressive Web App (PWA)**
Se quiser uma solução mais simples:
- ✅ Instalável como app
- ✅ Funciona offline
- ✅ Notificações web
- ❌ Não está nas lojas oficiais

### **React Native (Longo Prazo)**
Para performance máxima:
- ✅ Performance nativa
- ✅ Acesso completo às APIs
- ❌ Requer reescrita significativa (2-4 meses)

## 📞 **Próximos Passos**

1. **Decidir**: Capacitor vs React Native vs PWA
2. **Setup**: Contas de desenvolvedor
3. **Implementar**: Seguir este guia
4. **Testar**: Em dispositivos reais
5. **Deploy**: Para as lojas

**Recomendação**: Começar com Capacitor para validar o mercado mobile, depois migrar para React Native se necessário.
