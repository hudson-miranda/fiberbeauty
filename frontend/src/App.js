import React from 'react';
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/nps-rating" element={<NPSRating />} />
              
                {/* Rotas protegidas */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Clientes */}
                <Route path="clients" element={<ClientsList />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id" element={<ClientDetails />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />
                
                {/* Atendimentos */}
                <Route path="attendances" element={<AttendancesList />} />
                <Route path="attendances/new" element={<AttendanceNew />} />
                <Route path="attendances/:id" element={<AttendanceDetails />} />
                <Route path="attendances/:id/edit" element={<AttendanceEdit />} />
                
                {/* Formulários de Atendimento */}
                <Route path="attendance-forms" element={<AttendanceFormsList />} />
                <Route path="attendance-forms/new" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AttendanceFormNew />
                  </ProtectedRoute>
                } />
                <Route path="attendance-forms/:id" element={<AttendanceFormDetails />} />
                <Route path="attendance-forms/:id/edit" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AttendanceFormEdit />
                  </ProtectedRoute>
                } />
                
                {/* Usuários - Apenas Admin */}
                <Route path="users" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UsersList />
                  </ProtectedRoute>
                } />
                <Route path="users/new" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UserNew />
                  </ProtectedRoute>
                } />
                <Route path="users/:id" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UserDetails />
                  </ProtectedRoute>
                } />
                <Route path="users/:id/edit" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UserEdit />
                  </ProtectedRoute>
                } />
                
                {/* Rota de Relatórios removida */}
                
                {/* Perfil e Configurações */}
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
                
                {/* Configurações - Placeholder */}
                <Route path="settings" element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Configurações
                    </h1>
                    <p className="text-gray-600">
                      Esta funcionalidade será implementada em breve.
                    </p>
                  </div>
                } />
              </Route>
              
              {/* Rota catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                  },
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
