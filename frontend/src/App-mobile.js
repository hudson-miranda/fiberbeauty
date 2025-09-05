import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import ClientForm from './pages/ClientForm';
import ClientDetails from './pages/ClientDetails';
import AttendancesList from './pages/AttendancesList';
import AttendanceNew from './pages/AttendanceNew';
import AttendanceDetails from './pages/AttendanceDetails';
import AttendanceEdit from './pages/AttendanceEdit';
import AttendanceFormsList from './pages/AttendanceFormsList';
import AttendanceFormNew from './pages/AttendanceFormNew';
import AttendanceFormDetails from './pages/AttendanceFormDetails';
import AttendanceFormEdit from './pages/AttendanceFormEdit';
import UsersList from './pages/UsersList';
import UserNew from './pages/UserNew';
import UserDetails from './pages/UserDetails';
import UserEdit from './pages/UserEdit';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import NPSRating from './pages/NPSRating';
import { useNetworkStatus, usePlatformInfo } from './hooks/useMobile';
import './styles/mobile.css';

// Capacitor imports (only load if available)
let StatusBar, SplashScreen, Capacitor;
try {
  const capacitorModules = require('@capacitor/core');
  Capacitor = capacitorModules.Capacitor;
  
  if (Capacitor.isNativePlatform()) {
    StatusBar = require('@capacitor/status-bar').StatusBar;
    SplashScreen = require('@capacitor/splash-screen').SplashScreen;
  }
} catch (error) {
  console.log('Capacitor not available - running as web app');
}

// Network status component
const NetworkStatus = () => {
  const isOnline = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="network-status offline">
      Sem conexão com a internet
    </div>
  );
};

function App() {
  const platformInfo = usePlatformInfo();

  useEffect(() => {
    // Configure app for native platforms
    if (platformInfo.isNative && StatusBar && SplashScreen) {
      // Configure status bar
      StatusBar.setStyle({ 
        style: platformInfo.isIOS ? 'light' : 'default' 
      });
      
      if (platformInfo.isAndroid) {
        StatusBar.setBackgroundColor({ color: '#e5a823' });
      }
      
      // Hide splash screen after app loads
      const timer = setTimeout(() => {
        SplashScreen.hide();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [platformInfo]);

  // Add platform classes to body
  useEffect(() => {
    const bodyClassList = document.body.classList;
    
    if (platformInfo.isNative) {
      bodyClassList.add('capacitor-app');
      bodyClassList.add(`capacitor-platform-${platformInfo.platform}`);
      
      if (platformInfo.isIOS) {
        bodyClassList.add('ios-safe-area-top');
      }
    } else {
      bodyClassList.add('web-app');
    }

    return () => {
      bodyClassList.remove('capacitor-app', 'web-app', 'capacitor-platform-ios', 'capacitor-platform-android', 'ios-safe-area-top');
    };
  }, [platformInfo]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <NetworkStatus />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/nps-rating" element={<NPSRating />} />
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          
                          {/* Clientes */}
                          <Route path="/clients" element={<ClientsList />} />
                          <Route path="/clients/new" element={<ClientForm />} />
                          <Route path="/clients/:id" element={<ClientDetails />} />
                          <Route path="/clients/:id/edit" element={<ClientForm />} />
                          
                          {/* Atendimentos */}
                          <Route path="/attendances" element={<AttendancesList />} />
                          <Route path="/attendances/new" element={<AttendanceNew />} />
                          <Route path="/attendances/:id" element={<AttendanceDetails />} />
                          <Route path="/attendances/:id/edit" element={<AttendanceEdit />} />
                          
                          {/* Fichas de Atendimento */}
                          <Route path="/attendance-forms" element={<AttendanceFormsList />} />
                          <Route path="/attendance-forms/new" element={<AttendanceFormNew />} />
                          <Route path="/attendance-forms/:id" element={<AttendanceFormDetails />} />
                          <Route path="/attendance-forms/:id/edit" element={<AttendanceFormEdit />} />
                          
                          {/* Usuários */}
                          <Route path="/users" element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <UsersList />
                            </ProtectedRoute>
                          } />
                          <Route path="/users/new" element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <UserNew />
                            </ProtectedRoute>
                          } />
                          <Route path="/users/:id" element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <UserDetails />
                            </ProtectedRoute>
                          } />
                          <Route path="/users/:id/edit" element={
                            <ProtectedRoute requiredRole="ADMIN">
                              <UserEdit />
                            </ProtectedRoute>
                          } />
                          
                          {/* Perfil */}
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/change-password" element={<ChangePassword />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              
              <Toaster 
                position={platformInfo.isNative ? "top-center" : "top-right"}
                toastOptions={{
                  duration: platformInfo.isNative ? 3000 : 4000,
                  style: {
                    fontSize: platformInfo.isNative ? '16px' : '14px',
                    padding: platformInfo.isNative ? '12px' : '8px',
                    marginTop: platformInfo.isNative ? '60px' : '0px', // Account for native header
                  },
                }}
              />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
