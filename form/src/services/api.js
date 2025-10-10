const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Municípios e Espécies
  getMunicipios: async () => {
    const response = await fetch(`${API_URL}/municipios`);
    if (!response.ok) throw new Error('Erro ao buscar municípios');
    return response.json();
  },

  getEspecies: async () => {
    const response = await fetch(`${API_URL}/especies`);
    if (!response.ok) throw new Error('Erro ao buscar espécies');
    return response.json();
  },

  // Desembarques
  criarDesembarque: async (dados) => {
    const response = await fetch(`${API_URL}/desembarques`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Erro ao criar desembarque');
    }
    
    return result;
  },

  listarDesembarques: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const response = await fetch(`${API_URL}/desembarques?${params}`);
    if (!response.ok) throw new Error('Erro ao listar desembarques');
    return response.json();
  },

  buscarDesembarque: async (id) => {
    const response = await fetch(`${API_URL}/desembarques/${id}`);
    if (!response.ok) throw new Error('Erro ao buscar desembarque');
    return response.json();
  }
};