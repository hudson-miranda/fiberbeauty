import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 60000, // Aumentado para 60 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Só redirecionar se não estivermos já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        toast.error('Sessão expirada. Faça login novamente.');
      }
    } else if (response?.status === 403) {
      toast.error('Acesso negado. Você não tem permissão para esta ação.');
    } else if (response?.status === 429) {
      toast.error('Muitas tentativas. Aguarde alguns minutos.');
    } else if (response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (response?.data?.error) {
      toast.error(response.data.error);
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      toast.error('Erro inesperado. Tente novamente.');
    }

    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(data) {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// Serviços de Clientes
export const clientService = {
  async list(params = {}) {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async getByCpf(cpf) {
    const response = await api.get(`/clients/cpf/${cpf}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/clients', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

// Serviços de Fichas de Atendimento
export const attendanceFormService = {
  async list(params = {}) {
    const response = await api.get('/attendance-forms', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/attendance-forms/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/attendance-forms', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/attendance-forms/${id}`, data);
    return response.data;
  },

  async duplicate(id, data) {
    const response = await api.post(`/attendance-forms/${id}/duplicate`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/attendance-forms/${id}`);
    return response.data;
  },
};

// Serviços de Atendimentos
export const attendanceService = {
  async list(params = {}) {
    const response = await api.get('/attendances', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/attendances/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/attendances', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/attendances/${id}`, data);
    return response.data;
  },

  async finalize(id) {
    const response = await api.patch(`/attendances/${id}/finalize`);
    return response.data;
  },

  async getStats(params = {}) {
    const response = await api.get('/attendances/stats', { params });
    return response.data;
  },
  
  async delete(id) {
    const response = await api.delete(`/attendances/${id}`);
    return response.data;
  },
};

// Serviços de Usuários
export const userService = {
  async list(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async reactivate(id) {
    const response = await api.patch(`/users/${id}/reactivate`);
    return response.data;
  },
};

// Serviços de NPS
export const npsService = {
  async create(data) {
    const response = await api.post('/nps', data);
    return response.data;
  },

  async list(params = {}) {
    const response = await api.get('/nps', { params });
    return response.data;
  },

  async getStatistics(params = {}) {
    const response = await api.get('/nps/statistics', { params });
    return response.data;
  },

  async getByAttendanceId(attendanceId) {
    const response = await api.get(`/nps/attendance/${attendanceId}`);
    return response.data;
  },

  async getAttendancesByCategory(params = {}) {
    const response = await api.get('/nps/attendances/category', { params });
    return response.data;
  },
};

// Serviço de Relatórios
export default api;
