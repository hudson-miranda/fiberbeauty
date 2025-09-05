import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setValue,
  } = useForm();

  // Focar no campo username ao carregar
  useEffect(() => {
    setFocus('username');
  }, [setFocus]);

  // Redirecionar se já autenticado
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Mostrar loading se ainda carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setLoginLoading(true);
    try {
      await login(data);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-white">FB</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Fiber Beauty
          </h2>
          <p className="mt-2 text-gray-600">
            Sistema de Gerenciamento de Atendimentos
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                label="Nome de usuário"
                type="text"
                placeholder="Digite seu nome de usuário"
                leftIcon={<UserIcon className="h-5 w-5" />}
                error={errors.username?.message}
                {...register('username', {
                  required: 'Nome de usuário é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome de usuário deve ter pelo menos 3 caracteres'
                  }
                })}
              />
            </div>

            <div>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                leftIcon={<LockClosedIcon className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loginLoading}
              disabled={loginLoading}
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2024 Fiber Beauty. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
