import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { FormSkeleton } from '../components/LoadingSpinner';
import { userService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  LockClosedIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Estados locais para os valores do formulário
  const [formValues, setFormValues] = useState({
    name: '',
    username: '',
    role: 'ATTENDANT',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  // Debug: log dos valores do formulário
  useEffect(() => {
    console.log('formValues atualizados:', formValues);
  }, [formValues]);

  // Função para validar os dados
  const validateForm = () => {
    const newErrors = {};

    if (!formValues.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formValues.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formValues.username.trim()) {
      newErrors.username = 'Nome de usuário é obrigatório';
    } else if (formValues.username.length < 3) {
      newErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formValues.username)) {
      newErrors.username = 'Nome de usuário deve conter apenas letras, números e underscore';
    }

    if (!formValues.role) {
      newErrors.role = 'Função é obrigatória';
    }

    if (formValues.password) {
      if (formValues.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }
      if (!formValues.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória quando nova senha é fornecida';
      } else if (formValues.password !== formValues.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Carregar dados do usuário
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        console.log('Carregando usuário com ID:', id);
        const userData = await userService.getById(id);
        console.log('Dados do usuário carregados:', userData);
        console.log('userData completo:', JSON.stringify(userData, null, 2));
        
        // Os dados podem estar aninhados, vamos verificar
        const actualUserData = userData.user || userData;
        console.log('actualUserData:', actualUserData);
        
        setUser(actualUserData);
        
        // Atualizar os estados locais
        const newFormValues = {
          name: actualUserData.name || '',
          username: actualUserData.username || '',
          role: actualUserData.role || 'ATTENDANT',
          password: '',
          confirmPassword: ''
        };
        
        console.log('Dados carregados e formulário atualizado:', newFormValues);
        console.log('actualUserData.name:', actualUserData.name);
        console.log('actualUserData.username:', actualUserData.username);
        console.log('actualUserData.role:', actualUserData.role);
        
        setFormValues(newFormValues);
        setDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        toast.error('Erro ao carregar dados do usuário');
        navigate('/users');
      } finally {
        setLoadingUser(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);

      const userData = {
        name: formValues.name,
        username: formValues.username,
        role: formValues.role
      };

      // Incluir senha apenas se foi fornecida
      if (formValues.password) {
        userData.password = formValues.password;
      }

      await userService.update(id, userData);
      
      toast.success('Usuário atualizado com sucesso!');
      navigate('/users');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return <FormSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <Button
            onClick={() => navigate('/users')}
            className="mt-4"
          >
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/users')}
                className="mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Usuário</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Atualize as informações do usuário {user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <div className="p-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    key={`name-${dataLoaded ? user?.id : 'loading'}`}
                    label="Nome Completo"
                    placeholder="Digite o nome completo"
                    value={formValues.name}
                    error={errors.name?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Nome alterado para:', value);
                      setFormValues(prev => ({ ...prev, name: value }));
                    }}
                  />

                  <Select
                    key={`role-${dataLoaded ? user?.id : 'loading'}`}
                    label="Função"
                    value={formValues.role}
                    error={errors.role?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Função alterada para:', value);
                      setFormValues(prev => ({ ...prev, role: value }));
                    }}
                  >
                    <option value="ATTENDANT">Atendente</option>
                    <option value="ADMIN">Administrador</option>
                  </Select>
                </div>
              </div>

              {/* Dados de Acesso */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <IdentificationIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Dados de Acesso
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <Input
                    key={`username-${dataLoaded ? user?.id : 'loading'}`}
                    label="Nome de Usuário"
                    placeholder="Digite o nome de usuário"
                    value={formValues.username}
                    error={errors.username?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Username alterado para:', value);
                      setFormValues(prev => ({ ...prev, username: value }));
                    }}
                  />
                </div>
              </div>

              {/* Alterar Senha */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Alterar Senha
                </h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Opcional:</strong> Deixe os campos de senha em branco se não deseja alterá-la.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nova Senha"
                    type="password"
                    placeholder="Digite a nova senha (opcional)"
                    value={formValues.password}
                    error={errors.password?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormValues(prev => ({ ...prev, password: value }));
                    }}
                  />

                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={formValues.confirmPassword}
                    error={errors.confirmPassword?.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormValues(prev => ({ ...prev, confirmPassword: value }));
                    }}
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  loading={loading}
                  className="min-w-[120px]"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserEdit;
