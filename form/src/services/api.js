const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'Erro na requisição',
      response.status,
      data
    );
  }
  
  return data;
};

export const api = {
  // Municípios e Espécies
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

  // Desembarques
  criarDesembarque: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/desembarques`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
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
      const response = await fetch(`${API_URL}/desembarques?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar desembarques:', error);
      throw error;
    }
  },

  buscarDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar desembarque:', error);
      throw error;
    }
  },

  atualizarDesembarque: async (id, dados) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar desembarque:', error);
      throw error;
    }
  },

  deletarDesembarque: async (id) => {
    try {
      const response = await fetch(`${API_URL}/desembarques/${id}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json'
        }
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao deletar desembarque:', error);
      throw error;
    }
  },

  obterEstatisticas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/desembarques/estatisticas?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  },

  // Pescadores
  listarPescadores: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/pescadores?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar pescadores:', error);
      throw error;
    }
  },

  criarPescador: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/pescadores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar pescador:', error);
      throw error;
    }
  },

  buscarPescador: async (id) => {
    try {
      const response = await fetch(`${API_URL}/pescadores/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar pescador:', error);
      throw error;
    }
  },

  // Embarcações
  listarEmbarcacoes: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros);
      const response = await fetch(`${API_URL}/embarcacoes?${params}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao listar embarcações:', error);
      throw error;
    }
  },

  criarEmbarcacao: async (dados) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dados)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao criar embarcação:', error);
      throw error;
    }
  },

  buscarEmbarcacao: async (id) => {
    try {
      const response = await fetch(`${API_URL}/embarcacoes/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar embarcação:', error);
      throw error;
    }
  }
};

export default api;