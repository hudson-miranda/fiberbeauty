import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  // Redireciona baseado no role do usuário
  if (user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/clients" replace />;
  }
};

export default RoleBasedRedirect;