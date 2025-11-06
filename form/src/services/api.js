const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Função para obter o token do localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Função para criar headers com autenticação
const getAuthHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  // Se retornar 401 (não autorizado), redirecionar para login
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'Erro na requisição',
      response.status,
      data
    );
  }
  
  return data;
};

const api = {
  // ==================== AUTENTICAÇÃO ====================
  
  login: async (email, senha) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  registrar: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  },

  obterPerfil: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/perfil`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  },

  alterarSenha: async (senhaAtual, novaSenha) => {
    try {
      const response = await fetch(`${API_URL}/auth/senha`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ senhaAtual, novaSenha })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  },

  // ==================== USUÁRIOS ====================

  listarUsuarios: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/usuarios?${params}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  },

  criarUsuario: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  deletarUsuario: async (id) => {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // ==================== MUNICÍPIOS E ESPÉCIES ====================

  getMunicipios: async () => {
    try {
      const response = await fetch(`${API_URL}/municipios`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      throw error;
    }
  },

  getEspecies: async () => {
    try {
      const response = await fetch(`${API_URL}/especies`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar espécies:', error);
      throw error;
    }
  },

  // ==================== DESEMBARQUE ====================

  criarDesembarque: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/desembarques`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar desembarque:', error);
      throw error;
    }
  },

  listarDesembarques: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/desembarques?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar desembarques:', error);
      throw error;
    }
  },

  getDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar desembarque:', error);
      throw error;
    }
  },

  deletarDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar desembarque:', error);
      throw error;
    }
  },

  // ==================== EMBARCAÇÕES ====================

  criarEmbarcacao: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar embarcação:', error);
      throw error;
    }
  },

  listarEmbarcacoes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/embarcacoes?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar embarcações:', error);
      throw error;
    }
  },

  getEmbarcacao: async (id) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar embarcação:', error);
      throw error;
    }
  },

  // ==================== PESCADORES ====================

  criarPescador: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/pescadores`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar pescador:', error);
      throw error;
    }
  },

  listarPescadores: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/pescadores?${params}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar pescadores:', error);
      throw error;
    }
  },

  getPescador: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pescadores/${id}`, {
        headers: getAuthHeaders()
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar pescador:', error);
      throw error;
    }
  }
};

export default api;