import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

// Estados de autenticação
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Actions
const authActions = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case authActions.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case authActions.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case authActions.LOAD_USER_START:
      return {
        ...state,
        isLoading: true,
      };

    case authActions.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
      };

    case authActions.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case authActions.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Carregar usuário ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          dispatch({
            type: authActions.LOGIN_SUCCESS,
            payload: { user: parsedUser, token },
          });
          // Verificar se o token ainda é válido carregando dados atualizados
          await loadUser();
        } catch (error) {
          console.error('Erro ao carregar dados do localStorage:', error);
          logout();
        }
      } else {
        dispatch({ type: authActions.LOGOUT });
      }
    };

    initializeAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Função de login
  const login = async (credentials) => {
    try {
      dispatch({ type: authActions.LOGIN_START });

      const response = await authService.login(credentials);
      const { user, token } = response;

      // Salvar no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Bem-vindo(a), ${user.name}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      
      dispatch({
        type: authActions.LOGIN_FAILURE,
        payload: errorMessage,
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    dispatch({ type: authActions.LOGOUT });
    toast.success('Logout realizado com sucesso');
  };

  // Carregar dados atualizados do usuário
  const loadUser = async () => {
    try {
      dispatch({ type: authActions.LOAD_USER_START });

      const response = await authService.me();
      const { user } = response;

      // Atualizar localStorage
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: authActions.LOAD_USER_SUCCESS,
        payload: user,
      });
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      
      dispatch({
        type: authActions.LOAD_USER_FAILURE,
        payload: 'Erro ao carregar dados do usuário',
      });

      // Se token inválido, fazer logout automático
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Alterar senha
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      toast.success('Senha alterada com sucesso');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao alterar senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Atualizar dados do usuário no state
  const updateUser = (userData) => {
    dispatch({
      type: authActions.UPDATE_USER,
      payload: userData,
    });

    // Atualizar localStorage
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Limpar erros
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  // Verificar se usuário tem permissão
  const hasPermission = (requiredRole) => {
    if (!state.user) return false;
    
    if (requiredRole === 'ADMIN') {
      return state.user.role === 'ADMIN';
    }
    
    if (requiredRole === 'ATTENDANT') {
      return ['ADMIN', 'ATTENDANT'].includes(state.user.role);
    }
    
    return true;
  };

  // Verificar se é admin
  const isAdmin = () => {
    return state.user?.role === 'ADMIN';
  };

  // Verificar se é atendente
  const isAttendant = () => {
    return state.user?.role === 'ATTENDANT';
  };

  const value = {
    ...state,
    login,
    logout,
    loadUser,
    changePassword,
    updateUser,
    clearError,
    hasPermission,
    isAdmin,
    isAttendant,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;
