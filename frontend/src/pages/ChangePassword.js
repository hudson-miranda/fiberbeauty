import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  KeyIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import clsx from 'clsx';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    return { score, checks };
  };

  const { score, checks } = getStrength(password);

  const getStrengthText = (score) => {
    if (score === 0) return '';
    if (score <= 2) return 'Fraca';
    if (score <= 3) return 'Média';
    if (score <= 4) return 'Forte';
    return 'Muito Forte';
  };

  const getStrengthColor = (score) => {
    if (score === 0) return '';
    if (score <= 2) return 'text-red-600';
    if (score <= 3) return 'text-gold-600';
    if (score <= 4) return 'text-primary-600';
    return 'text-emerald-600';
  };

  const getBarColor = (score) => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-gold-500';
    if (score <= 4) return 'bg-primary-500';
    return 'bg-emerald-500';
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Força da senha:</span>
        <span className={clsx('text-sm font-medium', getStrengthColor(score))}>
          {getStrengthText(score)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={clsx('h-2 rounded-full transition-all duration-300', getBarColor(score))}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className={clsx('flex items-center', checks.length ? 'text-green-600' : 'text-gray-400')}>
          {checks.length ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          )}
          Pelo menos 8 caracteres
        </div>
        
        <div className={clsx('flex items-center', checks.lowercase ? 'text-green-600' : 'text-gray-400')}>
          {checks.lowercase ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          )}
          Letra minúscula
        </div>
        
        <div className={clsx('flex items-center', checks.uppercase ? 'text-green-600' : 'text-gray-400')}>
          {checks.uppercase ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          )}
          Letra maiúscula
        </div>
        
        <div className={clsx('flex items-center', checks.numbers ? 'text-green-600' : 'text-gray-400')}>
          {checks.numbers ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          )}
          Número
        </div>
        
        <div className={clsx('flex items-center', checks.special ? 'text-green-600' : 'text-gray-400')}>
          {checks.special ? (
            <CheckCircleIcon className="w-3 h-3 mr-1" />
          ) : (
            <ExclamationCircleIcon className="w-3 h-3 mr-1" />
          )}
          Caractere especial
        </div>
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('A confirmação da senha não confere');
      return;
    }

    try {
      setLoading(true);
      
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Senha alterada com sucesso!');
      reset();
      navigate('/profile');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      const message = error.response?.data?.message || 'Erro ao alterar senha';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/profile')}
          className="flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alterar Senha</h1>
          <p className="mt-1 text-gray-600">
            Atualize sua senha para manter sua conta segura
          </p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <KeyIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Alterar Senha
              </h2>
              <p className="text-sm text-gray-600">
                {user?.name} (@{user?.username})
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Senha Atual */}
            <div>
              <label className="form-label">Senha Atual</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('currentPassword', {
                    required: 'Senha atual é obrigatória'
                  })}
                  error={errors.currentPassword?.message}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="form-label">Nova Senha</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('newPassword', {
                    required: 'Nova senha é obrigatória',
                    minLength: {
                      value: 8,
                      message: 'Nova senha deve ter pelo menos 8 caracteres'
                    }
                  })}
                  error={errors.newPassword?.message}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="form-label">Confirmar Nova Senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirmação da senha é obrigatória',
                    validate: (value) => 
                      value === newPassword || 'As senhas não conferem'
                  })}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              {confirmPassword && newPassword && confirmPassword !== newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  As senhas não conferem
                </p>
              )}
              
              {confirmPassword && newPassword && confirmPassword === newPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  As senhas conferem
                </p>
              )}
            </div>

            {/* Dicas de segurança */}
            <div className="bg-gold-50 p-4 rounded-lg border border-gold-100">
              <h3 className="text-sm font-medium text-primary-900 mb-2">
                Dicas para uma senha segura:
              </h3>
              <ul className="text-sm text-primary-800 space-y-1 list-disc list-inside">
                <li>Use pelo menos 8 caracteres</li>
                <li>Combine letras maiúsculas e minúsculas</li>
                <li>Inclua números e símbolos especiais</li>
                <li>Evite informações pessoais óbvias</li>
                <li>Não reutilize senhas de outras contas</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                loading={loading}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                Alterar Senha
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChangePassword;
